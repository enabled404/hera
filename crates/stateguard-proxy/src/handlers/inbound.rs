use crate::models::SecurityEvent;
use crate::state::AppState;
use serde_json::Value;
use stateguard_crypto::{AeadEnvelopeHandler, BoundEnvelope, ContextBinding, CryptoError};
use stateguard_scanner::compute_fingerprint;
use stateguard_vault::{is_token_handle, VaultEntry};

#[derive(Debug)]
pub enum InboundError {
    StateIntegrityViolation(String),
    ModelMismatch(String),
    Internal(String),
}

pub struct InboundProcessor<'a> {
    pub state: &'a AppState,
    pub tenant_id: String,
    pub user_id: String,
    pub session_id: String,
    pub branch_id: String,
    pub turn_index: u64,
    pub target_model: String,
    pub encapsulated_fallback: Option<String>,
}

impl<'a> InboundProcessor<'a> {
    pub fn new(
        state: &'a AppState,
        tenant_id: impl Into<String>,
        user_id: impl Into<String>,
        session_id: impl Into<String>,
        turn_index: u64,
        target_model: impl Into<String>,
    ) -> Self {
        Self::new_with_branch(
            state,
            tenant_id,
            user_id,
            session_id,
            "main",
            turn_index,
            target_model,
            None,
        )
    }

    pub fn new_with_branch(
        state: &'a AppState,
        tenant_id: impl Into<String>,
        user_id: impl Into<String>,
        session_id: impl Into<String>,
        branch_id: impl Into<String>,
        turn_index: u64,
        target_model: impl Into<String>,
        encapsulated_fallback: Option<String>,
    ) -> Self {
        Self {
            state,
            tenant_id: tenant_id.into(),
            user_id: user_id.into(),
            session_id: session_id.into(),
            branch_id: branch_id.into(),
            turn_index,
            target_model: target_model.into(),
            encapsulated_fallback,
        }
    }

    /// Recursively scans JSON request body, validates reasoning tokens, and restores original provider signatures
    pub async fn process_and_restore(&self, val: &mut Value) -> Result<(), InboundError> {
        match val {
            Value::Object(map) => {
                // Check Anthropic thinking signature
                if let Some(sig) = map.get_mut("signature") {
                    if let Some(s) = sig.as_str() {
                        let restored = self.validate_and_restore_token(s).await?;
                        *sig = Value::String(restored);
                    }
                }

                // Check OpenAI encrypted_content
                if let Some(enc) = map.get_mut("encrypted_content") {
                    if let Some(s) = enc.as_str() {
                        let restored = self.validate_and_restore_token(s).await?;
                        *enc = Value::String(restored);
                    }
                }

                // Check Gemini thought_signature
                if let Some(tsig) = map.get_mut("thought_signature") {
                    if let Some(s) = tsig.as_str() {
                        let restored = self.validate_and_restore_token(s).await?;
                        *tsig = Value::String(restored);
                    }
                }

                for (_, v) in map.iter_mut() {
                    Box::pin(self.process_and_restore(v)).await?;
                }
            }
            Value::Array(arr) => {
                for item in arr {
                    Box::pin(self.process_and_restore(item)).await?;
                }
            }
            _ => {}
        }
        Ok(())
    }

    async fn validate_and_restore_token(&self, token: &str) -> Result<String, InboundError> {
        // 1. Check if token is a vaulted handle (sgh_...)
        if is_token_handle(token) {
            let entry_res = self.state.vault.retrieve(token).await;
            let entry = match entry_res {
                Ok(Some(e)) => e,
                Ok(None) => {
                    // Hybrid Encapsulated State Recovery from X-StateGuard-Encapsulated-Fallback
                    let recovered_entry = if let Some(ref fallback_b64) = self.encapsulated_fallback {
                        let tenant_key = self
                            .state
                            .tenant_keys
                            .get(&self.tenant_id)
                            .map(|k| *k)
                            .unwrap_or(self.state.config.default_tenant_key);

                        match VaultEntry::restore_from_encapsulated(
                            fallback_b64,
                            &tenant_key,
                            &self.tenant_id,
                            &self.session_id,
                            &self.branch_id,
                        ) {
                            Ok(recovered) if recovered.handle == token => {
                                tracing::info!(
                                    "Transparently recovered evicted vault handle {} from encapsulated fallback",
                                    token
                                );
                                let _ = self.state.vault.store(recovered.clone()).await;
                                Some(recovered)
                            }
                            _ => None,
                        }
                    } else {
                        None
                    };

                    match recovered_entry {
                        Some(e) => e,
                        None => {
                            self.state
                                .record_event(SecurityEvent::new(
                                    &self.tenant_id,
                                    Some(self.session_id.clone()),
                                    "STATE_HANDLE_NOT_FOUND",
                                    "MEDIUM",
                                    Some(compute_fingerprint(token)),
                                    serde_json::json!({ "handle": token }),
                                ))
                                .await;
                            return Err(InboundError::StateIntegrityViolation(
                                "Referenced state handle not found or expired".to_string(),
                            ));
                        }
                    }
                }
                Err(e) => return Err(InboundError::Internal(e)),
            };

            // Enforce Cross-Tenant Replay Isolation
            if entry.tenant_id != self.tenant_id {
                self.state
                    .record_event(SecurityEvent::new(
                        &self.tenant_id,
                        Some(self.session_id.clone()),
                        "CROSS_USER_REPLAY",
                        "CRITICAL",
                        Some(compute_fingerprint(token)),
                        serde_json::json!({
                            "reason": "Cross-tenant state replay attempt",
                            "bound_tenant": entry.tenant_id,
                            "attempted_tenant": self.tenant_id
                        }),
                    ))
                    .await;
                return Err(InboundError::StateIntegrityViolation(format!(
                    "Cross-tenant state replay violation: token bound to {}",
                    entry.tenant_id
                )));
            }

            // Enforce Cross-User Replay Isolation
            if entry.user_id != self.user_id {
                self.state
                    .record_event(SecurityEvent::new(
                        &self.tenant_id,
                        Some(self.session_id.clone()),
                        "CROSS_USER_REPLAY",
                        "CRITICAL",
                        Some(compute_fingerprint(token)),
                        serde_json::json!({
                            "reason": "Cross-user state replay attempt",
                            "bound_user": entry.user_id,
                            "attempted_user": self.user_id
                        }),
                    ))
                    .await;
                return Err(InboundError::StateIntegrityViolation(format!(
                    "Cross-user state replay violation: token bound to user {}",
                    entry.user_id
                )));
            }

            // Enforce Session Binding
            if entry.session_id != self.session_id {
                self.state
                    .record_event(SecurityEvent::new(
                        &self.tenant_id,
                        Some(self.session_id.clone()),
                        "CROSS_SESSION_REPLAY",
                        "HIGH",
                        Some(compute_fingerprint(token)),
                        serde_json::json!({
                            "bound_session": entry.session_id,
                            "attempted_session": self.session_id
                        }),
                    ))
                    .await;
                return Err(InboundError::StateIntegrityViolation(
                    "Cross-session replay violation".to_string(),
                ));
            }

            // Enforce Branch Isolation (DAG-Aware)
            let is_branch_compatible = entry.branch_id == self.branch_id
                || entry.branch_id == "main"
                || entry.branch_id == "branch_main";
            if !is_branch_compatible {
                self.state
                    .record_event(SecurityEvent::new(
                        &self.tenant_id,
                        Some(self.session_id.clone()),
                        "CROSS_BRANCH_REPLAY",
                        "HIGH",
                        Some(compute_fingerprint(token)),
                        serde_json::json!({
                            "bound_branch": entry.branch_id,
                            "attempted_branch": self.branch_id
                        }),
                    ))
                    .await;
                return Err(InboundError::StateIntegrityViolation(format!(
                    "Cross-branch replay violation: token bound to branch {}, attempted use on {}",
                    entry.branch_id, self.branch_id
                )));
            }

            // Enforce Model Lineage Matching (Test Case B: Model Downgrade Replay)
            if !is_model_compatible(&entry.model_id, &self.target_model) {
                self.state
                    .record_event(SecurityEvent::new(
                        &self.tenant_id,
                        Some(self.session_id.clone()),
                        "MODEL_MISMATCH",
                        "HIGH",
                        Some(compute_fingerprint(token)),
                        serde_json::json!({
                            "bound_model": entry.model_id,
                            "target_model": self.target_model
                        }),
                    ))
                    .await;
                return Err(InboundError::ModelMismatch(format!(
                    "Model lineage violation: reasoning bound to {} cannot be replayed into {}",
                    entry.model_id, self.target_model
                )));
            }

            // Enforce Turn Ordinality (P_1: turn_{n+1} > turn_n)
            if self.turn_index <= entry.turn_index {
                self.state
                    .record_event(SecurityEvent::new(
                        &self.tenant_id,
                        Some(self.session_id.clone()),
                        "TURN_ORDINALITY_VIOLATION",
                        "HIGH",
                        Some(compute_fingerprint(token)),
                        serde_json::json!({
                            "bound_turn": entry.turn_index,
                            "request_turn": self.turn_index
                        }),
                    ))
                    .await;
                return Err(InboundError::StateIntegrityViolation(format!(
                    "Turn ordinality violation: turn {} <= prior turn {}",
                    self.turn_index, entry.turn_index
                )));
            }

            return Ok(entry.original_envelope);
        }

        // 2. Check if token is a BoundEnvelope string (Stateless Mode)
        if let Ok(env) = BoundEnvelope::from_opaque_string(token) {
            let tenant_key = self
                .state
                .tenant_keys
                .get(&self.tenant_id)
                .map(|k| *k)
                .unwrap_or(self.state.config.default_tenant_key);

            let trial_branch = if env.context.branch_id == self.branch_id
                || env.context.branch_id == "main"
                || env.context.branch_id == "branch_main"
            {
                env.context.branch_id.as_str()
            } else {
                self.branch_id.as_str()
            };

            let expected_context = ContextBinding::new_with_branch(
                &self.tenant_id,
                &self.user_id,
                &self.session_id,
                trial_branch,
                env.context.turn_index,
                &env.context.model_id,
            );

            // Check model lineage compatibility
            if !is_model_compatible(&env.context.model_id, &self.target_model) {
                self.state
                    .record_event(SecurityEvent::new(
                        &self.tenant_id,
                        Some(self.session_id.clone()),
                        "MODEL_MISMATCH",
                        "HIGH",
                        Some(compute_fingerprint(token)),
                        serde_json::json!({
                            "bound_model": env.context.model_id,
                            "target_model": self.target_model
                        }),
                    ))
                    .await;
                return Err(InboundError::ModelMismatch(format!(
                    "Model mismatch in bound envelope: bound to {}, target is {}",
                    env.context.model_id, self.target_model
                )));
            }

            // Enforce turn ordinality
            if self.turn_index <= env.context.turn_index {
                return Err(InboundError::StateIntegrityViolation(format!(
                    "Turn ordinality violation: {} <= {}",
                    self.turn_index, env.context.turn_index
                )));
            }

            match AeadEnvelopeHandler::decrypt(&tenant_key, &env, &expected_context) {
                Ok(raw_bytes) => {
                    let raw_str = String::from_utf8_lossy(&raw_bytes).to_string();
                    return Ok(raw_str);
                }
                Err(e) => {
                    let ev_type = match e {
                        CryptoError::TenantMismatch { .. }
                        | CryptoError::UserMismatch { .. }
                        | CryptoError::BranchMismatch { .. } => "CROSS_USER_REPLAY",
                        CryptoError::ModelMismatch { .. } => "MODEL_MISMATCH",
                        _ => "STATE_INTEGRITY_VIOLATION",
                    };
                    self.state
                        .record_event(SecurityEvent::new(
                            &self.tenant_id,
                            Some(self.session_id.clone()),
                            ev_type,
                            "CRITICAL",
                            Some(compute_fingerprint(token)),
                            serde_json::json!({ "error": e.to_string() }),
                        ))
                        .await;
                    return Err(InboundError::StateIntegrityViolation(e.to_string()));
                }
            }
        }

        // Token is not a StateGuard handle or envelope; pass through
        Ok(token.to_string())
    }
}

/// Checks if reasoning state from model A can be executed on model B.
pub fn is_model_compatible(bound_model: &str, target_model: &str) -> bool {
    let b = bound_model.to_lowercase();
    let t = target_model.to_lowercase();

    if b == t {
        return true;
    }

    // Disallow Opus -> Haiku downgrade
    if b.contains("opus") && t.contains("haiku") {
        return false;
    }

    // Disallow GPT-5 / o1 / o3 -> 4o-mini downgrade
    if (b.contains("gpt-5") || b.contains("o1") || b.contains("o3")) && t.contains("mini") {
        return false;
    }

    // Disallow Gemini Pro/Ultra -> Flash downgrade
    if (b.contains("pro") || b.contains("ultra")) && t.contains("flash") {
        return false;
    }

    // Require matching model family
    let b_family = extract_family(&b);
    let t_family = extract_family(&t);
    b_family == t_family
}

fn extract_family(model: &str) -> &'static str {
    if model.contains("claude") {
        "claude"
    } else if model.contains("gpt") || model.contains("o1") || model.contains("o3") {
        "openai"
    } else if model.contains("gemini") {
        "gemini"
    } else {
        "unknown"
    }
}

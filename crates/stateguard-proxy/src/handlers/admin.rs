use crate::models::{SecurityEvent, SessionRecord};
use crate::state::AppState;
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use serde_json::Value;
use uuid::Uuid;

pub async fn handle_health(State(state): State<AppState>) -> Response {
    (
        StatusCode::OK,
        Json(serde_json::json!({
            "status": "ok",
            "service": "stateguard-proxy",
            "mode": format!("{:?}", state.config.mode),
            "version": env!("CARGO_PKG_VERSION")
        })),
    )
        .into_response()
}

pub async fn handle_list_events(State(state): State<AppState>) -> Response {
    let events = state.events.read().await;
    (StatusCode::OK, Json(events.clone())).into_response()
}

pub async fn handle_list_sessions(State(state): State<AppState>) -> Response {
    let sessions: Vec<SessionRecord> = state
        .sessions
        .iter()
        .map(|entry| entry.value().clone())
        .collect();
    (StatusCode::OK, Json(sessions)).into_response()
}

pub async fn handle_create_session(
    State(state): State<AppState>,
    Json(payload): Json<Value>,
) -> Response {
    let tenant_id = payload
        .get("tenant_id")
        .and_then(|v| v.as_str())
        .unwrap_or("default-tenant")
        .to_string();

    let external_session_id = payload
        .get("external_session_id")
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| "sess-default")
        .to_string();

    let bound_user_id = payload
        .get("bound_user_id")
        .and_then(|v| v.as_str())
        .unwrap_or("default-user")
        .to_string();

    let model_family = payload
        .get("model_family")
        .and_then(|v| v.as_str())
        .unwrap_or("claude")
        .to_string();

    let session = SessionRecord {
        id: Uuid::new_v4(),
        tenant_id,
        external_session_id: external_session_id.clone(),
        bound_user_id,
        model_family,
        current_turn: 0,
        merkle_root: None,
        last_active: Utc::now(),
    };

    state.sessions.insert(external_session_id, session.clone());
    (StatusCode::CREATED, Json(session)).into_response()
}

pub async fn handle_record_security_event(
    State(state): State<AppState>,
    Json(payload): Json<Value>,
) -> Response {
    let tenant_id = payload
        .get("tenant_id")
        .and_then(|v| v.as_str())
        .unwrap_or("default-tenant");

    let event_type = payload
        .get("event_type")
        .and_then(|v| v.as_str())
        .unwrap_or("UNKNOWN_EVENT");

    let severity = payload
        .get("severity")
        .and_then(|v| v.as_str())
        .unwrap_or("MEDIUM");

    let session_id = payload
        .get("session_id")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let metadata = payload
        .get("metadata")
        .cloned()
        .unwrap_or_else(|| serde_json::json!({}));

    let event = SecurityEvent::new(
        tenant_id,
        session_id,
        event_type,
        severity,
        None,
        metadata,
    );

    state.record_event(event.clone()).await;
    (StatusCode::CREATED, Json(event)).into_response()
}

pub async fn handle_resign_traces(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(mut payload): Json<Value>,
) -> Result<Response, Response> {
    let tenant_id = headers
        .get("x-stateguard-tenant-id")
        .and_then(|h| h.to_str().ok())
        .or_else(|| payload.get("tenant_id").and_then(|v| v.as_str()))
        .unwrap_or("default-tenant")
        .to_string();

    let user_id = headers
        .get("x-stateguard-user-id")
        .and_then(|h| h.to_str().ok())
        .or_else(|| payload.get("user_id").and_then(|v| v.as_str()))
        .unwrap_or("migration-user")
        .to_string();

    let session_id = headers
        .get("x-stateguard-session-id")
        .and_then(|h| h.to_str().ok())
        .or_else(|| payload.get("session_id").and_then(|v| v.as_str()))
        .unwrap_or("migration-session")
        .to_string();

    let branch_id = headers
        .get("x-stateguard-branch")
        .and_then(|h| h.to_str().ok())
        .or_else(|| payload.get("branch_id").and_then(|v| v.as_str()))
        .unwrap_or("main")
        .to_string();

    let turn_index = headers
        .get("x-stateguard-turn")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.parse::<u64>().ok())
        .or_else(|| payload.get("turn_index").and_then(|v| v.as_u64()))
        .unwrap_or(1);

    let traces_processed = if let Some(traces) = payload.get("traces").and_then(|t| t.as_array()) {
        traces.len()
    } else if let Some(arr) = payload.as_array() {
        arr.len()
    } else {
        1
    };

    // Scrub credentials in memory
    let scrubbed_count = state.redactor.scrub_json(&mut payload);

    // Re-sign / vault reasoning signatures
    let mut signatures_vaulted = 0;
    resign_value_recursive(
        &state,
        &tenant_id,
        &user_id,
        &session_id,
        &branch_id,
        turn_index,
        &mut payload,
        &mut signatures_vaulted,
    )
    .await;

    let res_body = serde_json::json!({
        "status": "success",
        "sanitized_traces": payload.clone(),
        "traces": payload.clone(),
        "stats": {
            "traces_processed": traces_processed,
            "signatures_vaulted": signatures_vaulted,
            "credentials_scrubbed": scrubbed_count,
        }
    });

    Ok((StatusCode::OK, Json(res_body)).into_response())
}

fn resign_value_recursive<'a>(
    state: &'a AppState,
    tenant_id: &'a str,
    user_id: &'a str,
    session_id: &'a str,
    branch_id: &'a str,
    turn_index: u64,
    val: &'a mut Value,
    signatures_vaulted: &'a mut usize,
) -> std::pin::Pin<Box<dyn std::future::Future<Output = ()> + Send + 'a>> {
    Box::pin(async move {
        match val {
            Value::Object(map) => {
                if let Some(sig) = map.get_mut("signature") {
                    if let Some(s) = sig.as_str() {
                        if !s.starts_with("sgh_") && !s.starts_with("sg_env_") {
                            let replacement = vault_or_bind_signature(
                                state, tenant_id, user_id, session_id, branch_id, turn_index, "anthropic", s,
                            )
                            .await;
                            *sig = Value::String(replacement);
                            *signatures_vaulted += 1;
                        }
                    }
                }
                if let Some(enc) = map.get_mut("encrypted_content") {
                    if let Some(s) = enc.as_str() {
                        if !s.starts_with("sgh_") && !s.starts_with("sg_env_") {
                            let replacement = vault_or_bind_signature(
                                state, tenant_id, user_id, session_id, branch_id, turn_index, "openai", s,
                            )
                            .await;
                            *enc = Value::String(replacement);
                            *signatures_vaulted += 1;
                        }
                    }
                }
                if let Some(tsig) = map.get_mut("thought_signature") {
                    if let Some(s) = tsig.as_str() {
                        if !s.starts_with("sgh_") && !s.starts_with("sg_env_") {
                            let replacement = vault_or_bind_signature(
                                state, tenant_id, user_id, session_id, branch_id, turn_index, "gemini", s,
                            )
                            .await;
                            *tsig = Value::String(replacement);
                            *signatures_vaulted += 1;
                        }
                    }
                }
                for (_, v) in map.iter_mut() {
                    resign_value_recursive(
                        state, tenant_id, user_id, session_id, branch_id, turn_index, v, signatures_vaulted,
                    )
                    .await;
                }
            }
            Value::Array(arr) => {
                for v in arr.iter_mut() {
                    resign_value_recursive(
                        state, tenant_id, user_id, session_id, branch_id, turn_index, v, signatures_vaulted,
                    )
                    .await;
                }
            }
            _ => {}
        }
    })
}

async fn vault_or_bind_signature(
    state: &AppState,
    tenant_id: &str,
    user_id: &str,
    session_id: &str,
    branch_id: &str,
    turn_index: u64,
    provider: &str,
    raw_sig: &str,
) -> String {
    match state.config.mode {
        crate::models::ProxyMode::StatefulVault => {
            let handle = stateguard_vault::generate_token_handle();
            let entry = stateguard_vault::VaultEntry::new_with_branch(
                &handle,
                provider,
                raw_sig,
                tenant_id,
                user_id,
                session_id,
                branch_id,
                turn_index,
                "historical-migrated",
                3600 * 24 * 365,
            );
            let _ = state.vault.store(entry).await;
            handle
        }
        crate::models::ProxyMode::StatelessBinding => {
            let key = state
                .tenant_keys
                .get(tenant_id)
                .map(|k| *k)
                .unwrap_or(state.config.default_tenant_key);
            let ctx = stateguard_crypto::ContextBinding::new_with_branch(
                tenant_id,
                user_id,
                session_id,
                branch_id,
                turn_index,
                "historical-migrated",
            );
            match stateguard_crypto::AeadEnvelopeHandler::encrypt(
                &key,
                stateguard_crypto::CipherSuite::Aes256Gcm,
                ctx,
                raw_sig.as_bytes(),
                "tag-migrated",
            ) {
                Ok(env) => env.to_opaque_string().unwrap_or_else(|_| raw_sig.to_string()),
                Err(_) => raw_sig.to_string(),
            }
        }
    }
}

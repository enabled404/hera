use crate::models::ProxyMode;
use crate::state::AppState;
use bytes::Bytes;
use serde_json::Value;
use stateguard_crypto::{AeadEnvelopeHandler, CipherSuite, ContextBinding};
use stateguard_vault::{generate_token_handle, VaultEntry};
use std::sync::Arc;
use tokio::sync::Mutex;

const MAX_EVENT_FRAME_BYTES: usize = 10 * 1024 * 1024; // 10 MB DoS protection

#[derive(Debug, thiserror::Error)]
pub enum SseError {
    #[error("SSE event frame exceeded 10 MB limit without boundary")]
    FrameOverflow,
    #[error("Internal transformation error: {0}")]
    Internal(String),
}

pub struct SseTransformer {
    state: AppState,
    tenant_id: String,
    user_id: String,
    session_id: String,
    branch_id: String,
    turn_index: u64,
    model_id: String,
    buffer: Vec<u8>,
    pub last_fallback: Arc<Mutex<Option<String>>>,
}

impl SseTransformer {
    pub fn new(
        state: AppState,
        tenant_id: String,
        user_id: String,
        session_id: String,
        turn_index: u64,
        model_id: String,
    ) -> Self {
        Self::new_with_branch(
            state,
            tenant_id,
            user_id,
            session_id,
            "main".to_string(),
            turn_index,
            model_id,
        )
    }

    pub fn new_with_branch(
        state: AppState,
        tenant_id: String,
        user_id: String,
        session_id: String,
        branch_id: String,
        turn_index: u64,
        model_id: String,
    ) -> Self {
        Self {
            state,
            tenant_id,
            user_id,
            session_id,
            branch_id,
            turn_index,
            model_id,
            buffer: Vec::with_capacity(64 * 1024),
            last_fallback: Arc::new(Mutex::new(None)),
        }
    }

    /// Process incoming chunk bytes. Accumulates in buffer until strict event boundaries (\n\n or \r\n\r\n)
    pub async fn transform_chunk(&mut self, chunk: &[u8]) -> Bytes {
        match self.process_chunk_inner(chunk).await {
            Ok(bytes) => bytes,
            Err(e) => {
                tracing::error!("SSE streaming error: {}", e);
                Bytes::new()
            }
        }
    }

    async fn process_chunk_inner(&mut self, chunk: &[u8]) -> Result<Bytes, SseError> {
        self.buffer.extend_from_slice(chunk);

        if self.buffer.len() > MAX_EVENT_FRAME_BYTES {
            self.buffer.clear();
            return Err(SseError::FrameOverflow);
        }

        let mut output = Vec::new();

        // Loop while complete SSE event delimiter (\n\n or \r\n\r\n) exists in buffer
        loop {
            if let Some((start_pos, delim_len)) = find_event_delimiter(&self.buffer) {
                let event_bytes = self.buffer[..start_pos].to_vec();
                self.buffer.drain(..start_pos + delim_len);

                if !event_bytes.is_empty() {
                    let transformed = self.process_single_event(&event_bytes).await;
                    output.extend_from_slice(&transformed);
                    output.extend_from_slice(b"\n\n");
                }
            } else {
                break;
            }
        }

        Ok(Bytes::from(output))
    }

    pub async fn flush_remaining(&mut self) -> Bytes {
        if self.buffer.is_empty() {
            Bytes::new()
        } else {
            let remaining = std::mem::take(&mut self.buffer);
            let transformed = self.process_single_event(&remaining).await;
            let mut out = transformed;
            out.extend_from_slice(b"\n\n");
            Bytes::from(out)
        }
    }

    /// Parses and stream-transforms a single complete SSE event block
    async fn process_single_event(&self, event_raw: &[u8]) -> Vec<u8> {
        let text = String::from_utf8_lossy(event_raw);
        let mut event_name = None;
        let mut event_id = None;
        let mut data_lines = Vec::new();
        let mut other_lines = Vec::new();

        for line in text.lines() {
            if let Some(rest) = line.strip_prefix("event: ") {
                event_name = Some(rest.trim().to_string());
            } else if let Some(rest) = line.strip_prefix("id: ") {
                event_id = Some(rest.trim().to_string());
            } else if let Some(rest) = line.strip_prefix("data: ") {
                data_lines.push(rest.to_string());
            } else if line.starts_with(':') {
                // Comment line
                other_lines.push(line.to_string());
            } else if !line.is_empty() {
                other_lines.push(line.to_string());
            }
        }

        if data_lines.is_empty() {
            // Nothing to transform
            return event_raw.to_vec();
        }

        // Join multiple data lines if present
        let combined_data = data_lines.join("\n");
        let transformed_data = if combined_data.trim() == "[DONE]" {
            "[DONE]".to_string()
        } else if let Ok(mut json_val) = serde_json::from_str::<Value>(&combined_data) {
            self.transform_json_payload(&mut json_val).await;
            json_val.to_string()
        } else {
            let (redacted, _) = self.state.redactor.redact_text(&combined_data);
            redacted
        };

        let mut out = Vec::new();
        if let Some(ref ev) = event_name {
            out.extend_from_slice(format!("event: {}\n", ev).as_bytes());
        }
        if let Some(ref id) = event_id {
            out.extend_from_slice(format!("id: {}\n", id).as_bytes());
        }
        for other in other_lines {
            out.extend_from_slice(format!("{}\n", other).as_bytes());
        }
        out.extend_from_slice(format!("data: {}", transformed_data).as_bytes());

        out
    }

    async fn transform_json_payload(&self, val: &mut Value) {
        // 1. In-flight credential & entropy scrubbing
        let _ = self.state.redactor.scrub_json(val);

        // 2. Anthropic thinking signature in content_block
        if let Some(content_block) = val.get_mut("content_block") {
            if let Some(sig) = content_block.get_mut("signature") {
                if let Some(raw_sig) = sig.as_str() {
                    let replacement = self.vault_or_bind(raw_sig).await;
                    *sig = Value::String(replacement);
                }
            }
        }

        // 3. Anthropic delta signature
        if let Some(delta) = val.get_mut("delta") {
            if let Some(sig) = delta.get_mut("signature") {
                if let Some(raw_sig) = sig.as_str() {
                    let replacement = self.vault_or_bind(raw_sig).await;
                    *sig = Value::String(replacement);
                }
            }
        }

        // 4. OpenAI encrypted_content in choices delta
        if let Some(choices) = val.get_mut("choices").and_then(|c| c.as_array_mut()) {
            for choice in choices {
                if let Some(delta) = choice.get_mut("delta") {
                    if let Some(enc) = delta.get_mut("encrypted_content") {
                        if let Some(raw_enc) = enc.as_str() {
                            let replacement = self.vault_or_bind(raw_enc).await;
                            *enc = Value::String(replacement);
                        }
                    }
                }
            }
        }

        // 5. Gemini thought_signature in candidate parts
        if let Some(candidates) = val.get_mut("candidates").and_then(|c| c.as_array_mut()) {
            for cand in candidates {
                if let Some(parts) = cand
                    .get_mut("content")
                    .and_then(|c| c.get_mut("parts"))
                    .and_then(|p| p.as_array_mut())
                {
                    for part in parts {
                        if let Some(sig) = part.get_mut("thought_signature") {
                            if let Some(raw_sig) = sig.as_str() {
                                let replacement = self.vault_or_bind(raw_sig).await;
                                *sig = Value::String(replacement);
                            }
                        }
                    }
                }
            }
        }
    }

    async fn vault_or_bind(&self, raw_token: &str) -> String {
        match self.state.config.mode {
            ProxyMode::StatefulVault => {
                let handle = generate_token_handle();
                let entry = VaultEntry::new_with_branch(
                    &handle,
                    "upstream",
                    raw_token,
                    &self.tenant_id,
                    &self.user_id,
                    &self.session_id,
                    &self.branch_id,
                    self.turn_index,
                    &self.model_id,
                    3600, // 1 hour TTL
                );

                // Compute encapsulated fallback token under tenant key
                let tenant_key = self
                    .state
                    .tenant_keys
                    .get(&self.tenant_id)
                    .map(|k| *k)
                    .unwrap_or(self.state.config.default_tenant_key);

                if let Ok(fallback_token) = entry.create_encapsulated_fallback(&tenant_key) {
                    let mut lock = self.last_fallback.lock().await;
                    *lock = Some(fallback_token);
                }

                let _ = self.state.vault.store(entry).await;
                handle
            }
            ProxyMode::StatelessBinding => {
                let tenant_key = self
                    .state
                    .tenant_keys
                    .get(&self.tenant_id)
                    .map(|k| *k)
                    .unwrap_or(self.state.config.default_tenant_key);

                let ctx = ContextBinding::new_with_branch(
                    &self.tenant_id,
                    &self.user_id,
                    &self.session_id,
                    &self.branch_id,
                    self.turn_index,
                    &self.model_id,
                );

                let chain_tag = format!("tag-{}-{}-{}", self.session_id, self.branch_id, self.turn_index);
                match AeadEnvelopeHandler::encrypt(
                    &tenant_key,
                    CipherSuite::Aes256Gcm,
                    ctx,
                    raw_token.as_bytes(),
                    &chain_tag,
                ) {
                    Ok(env) => env.to_opaque_string().unwrap_or_else(|_| raw_token.to_string()),
                    Err(_) => raw_token.to_string(),
                }
            }
        }
    }
}

/// Helper to locate double-newline delimiter (\r\n\r\n or \n\n) in byte slice
fn find_event_delimiter(buf: &[u8]) -> Option<(usize, usize)> {
    if buf.len() < 2 {
        return None;
    }

    for i in 0..buf.len() - 1 {
        if buf[i] == b'\n' && buf[i + 1] == b'\n' {
            return Some((i, 2));
        }
        if i + 3 < buf.len()
            && buf[i] == b'\r'
            && buf[i + 1] == b'\n'
            && buf[i + 2] == b'\r'
            && buf[i + 3] == b'\n'
        {
            return Some((i, 4));
        }
    }
    None
}

use crate::models::ProxyMode;
use crate::state::AppState;
use bytes::Bytes;
use serde_json::Value;
use stateguard_crypto::{AeadEnvelopeHandler, CipherSuite, ContextBinding};
use stateguard_vault::{generate_token_handle, VaultEntry};

pub struct SseTransformer {
    state: AppState,
    tenant_id: String,
    user_id: String,
    session_id: String,
    turn_index: u64,
    model_id: String,
    buffer: String,
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
        Self {
            state,
            tenant_id,
            user_id,
            session_id,
            turn_index,
            model_id,
            buffer: String::new(),
        }
    }

    /// Process an incoming chunk of SSE bytes and return the transformed bytes
    pub async fn transform_chunk(&mut self, chunk: &[u8]) -> Bytes {
        let chunk_str = String::from_utf8_lossy(chunk);
        self.buffer.push_str(&chunk_str);

        let mut output = String::new();

        // SSE messages are delimited by double newlines (\n\n or \r\n\r\n)
        while let Some(pos) = self.buffer.find("\n\n") {
            let message = self.buffer[..pos].to_string();
            self.buffer.drain(..pos + 2);

            let transformed_message = self.process_sse_message(&message).await;
            output.push_str(&transformed_message);
            output.push_str("\n\n");
        }

        Bytes::from(output)
    }

    pub async fn flush_remaining(&mut self) -> Bytes {
        if self.buffer.is_empty() {
            Bytes::new()
        } else {
            let remaining = std::mem::take(&mut self.buffer);
            let transformed = self.process_sse_message(&remaining).await;
            Bytes::from(format!("{}\n\n", transformed))
        }
    }

    async fn process_sse_message(&self, msg: &str) -> String {
        let mut lines = Vec::new();
        for line in msg.lines() {
            if let Some(data_content) = line.strip_prefix("data: ") {
                if data_content.trim() == "[DONE]" {
                    lines.push("data: [DONE]".to_string());
                    continue;
                }

                if let Ok(mut json_val) = serde_json::from_str::<Value>(data_content) {
                    self.transform_json_payload(&mut json_val).await;
                    lines.push(format!("data: {}", json_val.to_string()));
                } else {
                    // Fallback redaction if not valid JSON
                    let (redacted, _) = self.state.redactor.redact_text(data_content);
                    lines.push(format!("data: {}", redacted));
                }
            } else {
                lines.push(line.to_string());
            }
        }
        lines.join("\n")
    }

    async fn transform_json_payload(&self, val: &mut Value) {
        // Recursively redact any leaked plaintext secrets from content/deltas
        let _ = self.state.redactor.scrub_json(val);

        // Transform Anthropic thinking signature
        if let Some(content_block) = val.get_mut("content_block") {
            if let Some(sig) = content_block.get_mut("signature") {
                if let Some(raw_sig) = sig.as_str() {
                    let replacement = self.vault_or_bind(raw_sig).await;
                    *sig = Value::String(replacement);
                }
            }
        }

        // Transform Anthropic delta signature
        if let Some(delta) = val.get_mut("delta") {
            if let Some(sig) = delta.get_mut("signature") {
                if let Some(raw_sig) = sig.as_str() {
                    let replacement = self.vault_or_bind(raw_sig).await;
                    *sig = Value::String(replacement);
                }
            }
        }

        // Transform OpenAI encrypted_content / choices delta
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

        // Transform Gemini thought_signature
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
                let entry = VaultEntry::new(
                    &handle,
                    "upstream",
                    raw_token,
                    &self.tenant_id,
                    &self.user_id,
                    &self.session_id,
                    self.turn_index,
                    &self.model_id,
                    3600, // 1 hour TTL
                );
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

                let ctx = ContextBinding::new(
                    &self.tenant_id,
                    &self.user_id,
                    &self.session_id,
                    self.turn_index,
                    &self.model_id,
                );

                let chain_tag = format!("tag-{}-{}", self.session_id, self.turn_index);
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

use crate::handlers::inbound::{InboundError, InboundProcessor};
use crate::sse::SseTransformer;
use crate::state::AppState;
use axum::{
    body::Body,
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use futures_util::StreamExt;
use serde_json::Value;

pub async fn handle_anthropic_messages(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(mut payload): Json<Value>,
) -> Result<Response, Response> {
    let tenant_id = headers
        .get("x-stateguard-tenant-id")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("default-tenant")
        .to_string();

    let user_id = headers
        .get("x-stateguard-user-id")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("default-user")
        .to_string();

    let session_id = headers
        .get("x-stateguard-session-id")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("default-session")
        .to_string();

    let turn_index = headers
        .get("x-stateguard-turn")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(1);

    let target_model = payload
        .get("model")
        .and_then(|m| m.as_str())
        .unwrap_or("claude-3-5-sonnet-20241022")
        .to_string();

    // 1. Process inbound payload: validate reasoning tokens & restore original signatures
    let processor = InboundProcessor::new(
        &state,
        &tenant_id,
        &user_id,
        &session_id,
        turn_index,
        &target_model,
    );

    if let Err(err) = processor.process_and_restore(&mut payload).await {
        return Err(match err {
            InboundError::StateIntegrityViolation(msg) => (
                StatusCode::FORBIDDEN,
                Json(serde_json::json!({
                    "error": {
                        "type": "StateIntegrityViolation",
                        "message": msg
                    }
                })),
            )
                .into_response(),
            InboundError::ModelMismatch(msg) => (
                StatusCode::FORBIDDEN,
                Json(serde_json::json!({
                    "error": {
                        "type": "ModelMismatchViolation",
                        "message": msg
                    }
                })),
            )
                .into_response(),
            InboundError::Internal(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({
                    "error": {
                        "type": "InternalProxyError",
                        "message": msg
                    }
                })),
            )
                .into_response(),
        });
    }

    let is_stream = payload
        .get("stream")
        .and_then(|s| s.as_bool())
        .unwrap_or(false);

    // Forward request to upstream or mock
    let upstream_url = format!("{}/v1/messages", state.config.anthropic_upstream_url);
    let mut req = state.client.post(&upstream_url).json(&payload);

    // Forward relevant headers
    for (k, v) in &headers {
        let name = k.as_str().to_lowercase();
        if name.starts_with("x-api-key") || name.starts_with("anthropic-") {
            req = req.header(k, v);
        }
    }

    let upstream_res = match req.send().await {
        Ok(res) => res,
        Err(err) => {
            return Err((
                StatusCode::BAD_GATEWAY,
                Json(serde_json::json!({
                    "error": {
                        "type": "UpstreamConnectionError",
                        "message": err.to_string()
                    }
                })),
            )
                .into_response());
        }
    };

    let status = StatusCode::from_u16(upstream_res.status().as_u16())
        .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);

    if is_stream {
        let mut transformer = SseTransformer::new(
            state.clone(),
            tenant_id,
            user_id,
            session_id,
            turn_index,
            target_model,
        );

        // Use async stream mapping for SSE transformation
        let transformed_stream = async_stream::stream! {
            let mut byte_stream = upstream_res.bytes_stream();
            while let Some(item) = byte_stream.next().await {
                if let Ok(bytes) = item {
                    let out = transformer.transform_chunk(&bytes).await;
                    if !out.is_empty() {
                        yield Ok::<_, std::io::Error>(out);
                    }
                }
            }
            let final_chunk = transformer.flush_remaining().await;
            if !final_chunk.is_empty() {
                yield Ok::<_, std::io::Error>(final_chunk);
            }
        };

        let body = Body::from_stream(transformed_stream);
        let mut response = Response::new(body);
        *response.status_mut() = status;
        response
            .headers_mut()
            .insert("content-type", "text/event-stream".parse().unwrap());
        response
            .headers_mut()
            .insert("cache-control", "no-cache".parse().unwrap());
        Ok(response)
    } else {
        // Non-streaming response
        let mut json_body: Value = upstream_res
            .json()
            .await
            .unwrap_or_else(|_| serde_json::json!({}));

        // Redact secrets and vault/bind signatures in non-streaming response
        let _ = state.redactor.scrub_json(&mut json_body);

        // Vault or bind signatures in response content
        if let Some(content) = json_body.get_mut("content").and_then(|c| c.as_array_mut()) {
            for block in content {
                if let Some(sig) = block.get_mut("signature") {
                    if let Some(raw_sig) = sig.as_str() {
                        let handle_or_envelope = match state.config.mode {
                            crate::models::ProxyMode::StatefulVault => {
                                let h = stateguard_vault::generate_token_handle();
                                let entry = stateguard_vault::VaultEntry::new(
                                    &h,
                                    "anthropic",
                                    raw_sig,
                                    &tenant_id,
                                    &user_id,
                                    &session_id,
                                    turn_index,
                                    &target_model,
                                    3600,
                                );
                                let _ = state.vault.store(entry).await;
                                h
                            }
                            crate::models::ProxyMode::StatelessBinding => {
                                let key = state
                                    .tenant_keys
                                    .get(&tenant_id)
                                    .map(|k| *k)
                                    .unwrap_or(state.config.default_tenant_key);
                                let ctx = stateguard_crypto::ContextBinding::new(
                                    &tenant_id,
                                    &user_id,
                                    &session_id,
                                    turn_index,
                                    &target_model,
                                );
                                match stateguard_crypto::AeadEnvelopeHandler::encrypt(
                                    &key,
                                    stateguard_crypto::CipherSuite::Aes256Gcm,
                                    ctx,
                                    raw_sig.as_bytes(),
                                    "tag-init",
                                ) {
                                    Ok(env) => env.to_opaque_string().unwrap_or_else(|_| raw_sig.to_string()),
                                    Err(_) => raw_sig.to_string(),
                                }
                            }
                        };
                        *sig = Value::String(handle_or_envelope);
                    }
                }
            }
        }

        Ok((status, Json(json_body)).into_response())
    }
}

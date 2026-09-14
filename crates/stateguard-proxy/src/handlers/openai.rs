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

pub async fn handle_openai_chat(
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

    let branch_id = headers
        .get("x-stateguard-branch")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("main")
        .to_string();

    let encapsulated_fallback = headers
        .get("x-stateguard-encapsulated-fallback")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string());

    let target_model = payload
        .get("model")
        .and_then(|m| m.as_str())
        .unwrap_or("gpt-4o")
        .to_string();

    // Process inbound request
    let processor = InboundProcessor::new_with_branch(
        &state,
        &tenant_id,
        &user_id,
        &session_id,
        &branch_id,
        turn_index,
        &target_model,
        encapsulated_fallback,
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

    let upstream_url = format!("{}/v1/chat/completions", state.config.openai_upstream_url);
    let mut req = state.client.post(&upstream_url).json(&payload);

    for (k, v) in &headers {
        let name = k.as_str().to_lowercase();
        if name == "authorization" || name.starts_with("openai-") {
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
        let mut transformer = SseTransformer::new_with_branch(
            state.clone(),
            tenant_id,
            user_id,
            session_id,
            branch_id,
            turn_index,
            target_model,
        );

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
        Ok(response)
    } else {
        let mut json_body: Value = upstream_res
            .json()
            .await
            .unwrap_or_else(|_| serde_json::json!({}));

        let _ = state.redactor.scrub_json(&mut json_body);

        let mut fallback_token: Option<String> = None;

        // Vault or bind encrypted_content in OpenAI response
        if let Some(choices) = json_body.get_mut("choices").and_then(|c| c.as_array_mut()) {
            for choice in choices {
                if let Some(msg) = choice.get_mut("message") {
                    if let Some(enc) = msg.get_mut("encrypted_content") {
                        if let Some(raw_enc) = enc.as_str() {
                            let handle = stateguard_vault::generate_token_handle();
                            let entry = stateguard_vault::VaultEntry::new_with_branch(
                                &handle,
                                "openai",
                                raw_enc,
                                &tenant_id,
                                &user_id,
                                &session_id,
                                &branch_id,
                                turn_index,
                                &target_model,
                                3600,
                            );
                            let tenant_key = state
                                .tenant_keys
                                .get(&tenant_id)
                                .map(|k| *k)
                                .unwrap_or(state.config.default_tenant_key);
                            if let Ok(fb) = entry.create_encapsulated_fallback(&tenant_key) {
                                fallback_token = Some(fb);
                            }
                            let _ = state.vault.store(entry).await;
                            *enc = Value::String(handle);
                        }
                    }
                }
            }
        }

        let mut res = (status, Json(json_body)).into_response();
        if let Some(fb) = fallback_token {
            if let Ok(hdr) = fb.parse() {
                res.headers_mut().insert("x-stateguard-encapsulated-fallback", hdr);
            }
        }
        Ok(res)
    }
}

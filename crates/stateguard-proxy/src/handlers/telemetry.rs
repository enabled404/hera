use crate::models::SecurityEvent;
use crate::state::AppState;
use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde_json::Value;

pub async fn handle_telemetry_egress(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(mut payload): Json<Value>,
) -> Response {
    let tenant_id = headers
        .get("x-stateguard-tenant-id")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("default-tenant")
        .to_string();

    let scrubbed_count = state.redactor.scrub_json(&mut payload);

    if scrubbed_count > 0 {
        state
            .record_event(SecurityEvent::new(
                &tenant_id,
                None,
                "SECRET_IN_STATE",
                "HIGH",
                None,
                serde_json::json!({
                    "scrubbed_count": scrubbed_count,
                    "target": "observability_trace"
                }),
            ))
            .await;
    }

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "status": "scrubbed_and_forwarded",
            "scrubbed_secrets_count": scrubbed_count,
            "telemetry": payload
        })),
    )
        .into_response()
}

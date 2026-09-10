use crate::models::{SecurityEvent, SessionRecord};
use crate::state::AppState;
use axum::{
    extract::State,
    http::StatusCode,
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

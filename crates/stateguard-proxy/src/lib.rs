pub mod config;
pub mod handlers;
pub mod models;
pub mod sse;
pub mod state;

pub use config::ProxyConfig;
pub use models::{ProxyMode, SecurityEvent, SessionRecord};
pub use state::AppState;

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

pub fn create_app(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Anthropic route
        .route("/v1/messages", post(handlers::handle_anthropic_messages))
        // OpenAI routes
        .route("/v1/chat/completions", post(handlers::handle_openai_chat))
        .route("/v1/responses", post(handlers::handle_openai_chat))
        // Gemini route
        .route(
            "/v1beta/models/*model_action",
            post(handlers::handle_gemini_generate),
        )
        // Telemetry safe egress
        .route(
            "/v1/telemetry/traces",
            post(handlers::handle_telemetry_egress),
        )
        // Administration & Monitoring APIs
        .route("/health", get(handlers::handle_health))
        .route(
            "/api/v1/events",
            get(handlers::handle_list_events).post(handlers::handle_record_security_event),
        )
        .route(
            "/api/v1/sessions",
            get(handlers::handle_list_sessions).post(handlers::handle_create_session),
        )
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

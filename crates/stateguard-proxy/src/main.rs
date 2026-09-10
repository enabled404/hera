use stateguard_proxy::{config::ProxyConfig, create_app, state::AppState};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,stateguard_proxy=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = ProxyConfig::default();
    let addr: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;

    tracing::info!(
        "Starting StateGuard Gateway Proxy on {} (Mode: {:?})",
        addr,
        config.mode
    );

    let state = AppState::new(config).await;
    let app = create_app(state);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

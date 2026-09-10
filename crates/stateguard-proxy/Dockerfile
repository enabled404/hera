FROM rust:1.98-slim-bookworm as builder

WORKDIR /usr/src/stateguard
COPY Cargo.toml Cargo.lock* ./
COPY crates ./crates
COPY tests ./tests

RUN cargo build --release --bin stateguard-proxy

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=builder /usr/src/stateguard/target/release/stateguard-proxy /usr/local/bin/stateguard-proxy
EXPOSE 8080

CMD ["stateguard-proxy"]

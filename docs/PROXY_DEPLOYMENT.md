# HERA: Gateway & Reverse Proxy Deployment Guide

StateGuard Proxy is a high-performance, asynchronous streaming reverse proxy written in Rust (using Axum, Tower, and Tokio). It sits directly in front of LLM provider endpoints (Anthropic, OpenAI, Gemini), intercepting reasoning tokens with sub-millisecond overhead.

---

## 1. Quickstart (Local Gateway)

### Installation
Download pre-compiled binaries from [GitHub Releases](https://github.com/enabled404/hera/releases) or build from source:

```bash
# Clone the repository
git clone https://github.com/enabled404/hera.git
cd hera

# Build optimized release binary
cargo build --release --bin stateguard

# Run the proxy gateway
./target/release/stateguard proxy \
  --port 8080 \
  --mode stateful-vault \
  --redis-url redis://127.0.0.1:6379 \
  --anthropic-upstream https://api.anthropic.com \
  --openai-upstream https://api.openai.com
```

---

## 2. Docker & Container Deployment

### Using Docker Run
```bash
docker run -d \
  --name stateguard-gateway \
  -p 8080:8080 \
  -e STATEGUARD_MODE=stateful-vault \
  -e STATEGUARD_PORT=8080 \
  -e STATEGUARD_MASTER_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef \
  -e STATEGUARD_REDIS_URL=redis://redis-cluster:6379 \
  ghcr.io/enabled404/stateguard:latest
```

### Docker Compose
```yaml
version: '3.8'

services:
  stateguard-proxy:
    image: ghcr.io/enabled404/stateguard:latest
    ports:
      - "8080:8080"
    environment:
      - STATEGUARD_MODE=stateful-vault
      - STATEGUARD_PORT=8080
      - STATEGUARD_MASTER_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
      - STATEGUARD_REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## 3. Kubernetes Production Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stateguard-gateway
  namespace: security-infrastructure
spec:
  replicas: 3
  selector:
    matchLabels:
      app: stateguard-gateway
  template:
    metadata:
      labels:
        app: stateguard-gateway
    spec:
      containers:
      - name: gateway
        image: ghcr.io/enabled404/stateguard:latest
        ports:
        - containerPort: 8080
        env:
        - name: STATEGUARD_MODE
          value: "stateful-vault"
        - name: STATEGUARD_MASTER_KEY
          valueFrom:
            secretKeyRef:
              name: stateguard-secrets
              key: master-key
        resources:
          limits:
            cpu: "2000m"
            memory: "1Gi"
          requests:
            cpu: "200m"
            memory: "256Mi"
```

---

## 4. Operational Modes

1. **`stateful-vault` (Recommended for Enterprise):**
   - Strips raw thinking envelopes from client responses.
   - Stores encrypted blobs in local RAM / Redis with TTL eviction.
   - Client receives lightweight, opaque handles (`sgh_...`).
2. **`stateless-encapsulated`:**
   - Wraps the provider envelope in an outer StateGuard AEAD layer with bound Associated Data.
   - Zero server-side state storage required.
3. **`transparent-audit`:**
   - Enforces Shannon entropy scrubbing and logs Merkle audit traces without modifying client payloads.

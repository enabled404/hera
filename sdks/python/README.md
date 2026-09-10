# StateGuard Python SDK

Enterprise Agent State Security Gateway & Trace Auditing Client.

## Installation

```bash
pip install stateguard
```

With optional integrations:

```bash
pip install "stateguard[all]"
# or individually:
pip install "stateguard[httpx,otel,langchain]"
```

## Quickstart

```python
from stateguard import StateGuardClient, StateGuardConfig
from anthropic import Anthropic

client = StateGuardClient(StateGuardConfig(
    gateway_url="http://localhost:8080",
    tenant_id="tenant-alpha",
    user_id="user-alice",
    session_id="session-001"
))

# Wrap official Anthropic client
anthropic_client = client.wrap_anthropic(Anthropic())
```

See the main documentation at [stateguard.io](https://stateguard.io).

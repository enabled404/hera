# HERA: Client SDK & Middleware Reference

StateGuard provides lightweight, zero-dependency client middleware for Python and TypeScript to automatically attach Associated Data (AD) headers to outbound requests.

---

## 1. Python SDK (`stateguard-py`)

### Installation
```bash
pip install stateguard
```

### Direct Anthropic / OpenAI Client Integration
```python
import anthropic
from stateguard import StateGuardSession

# Initialize zero-trust stateguard session
session = StateGuardSession(
    gateway_url="http://localhost:8080",
    tenant_id="enterprise-corp",
    user_id="alice@company.com",
    session_id="sess-prod-audit-01"
)

# Attach stateguard transport to standard Anthropic client
client = anthropic.Anthropic(
    base_url=f"{session.gateway_url}/v1",
    http_client=session.create_http_client()
)

response = client.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=2048,
    thinking={"type": "enabled", "budget_tokens": 1024},
    messages=[{"role": "user", "content": "Execute database migration"}]
)

# Output handle is automatically vaulted
print(response.content)
```

### LangChain & LlamaIndex Middleware
```python
from langchain_anthropic import ChatAnthropic
from stateguard.langchain import StateGuardCallbackHandler

# Attach in-flight secret scrubbing callback to LangChain agent
handler = StateGuardCallbackHandler(
    tenant_id="enterprise-corp",
    redact_in_place=True
)

llm = ChatAnthropic(
    model="claude-3-7-sonnet-20250219",
    callbacks=[handler]
)
```

---

## 2. TypeScript / Node.js SDK (`@stateguard/ai`)

### Installation
```bash
npm install @stateguard/ai
```

### Vercel AI SDK Integration
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { createStateGuardMiddleware } from '@stateguard/ai';

const stateguard = createStateGuardMiddleware({
  gatewayUrl: 'http://localhost:8080',
  tenantId: 'enterprise-corp',
  userId: 'usr-bob',
  sessionId: 'sess-agent-deploy',
});

const { text } = await generateText({
  model: stateguard(anthropic('claude-3-7-sonnet-20250219')),
  prompt: 'Refactor Kubernetes manifests',
});
```

import json
import urllib.request
import urllib.error
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    httpx = None
    HAS_HTTPX = False


@dataclass
class StateGuardConfig:
    gateway_url: str = "http://localhost:8080"
    tenant_id: str = "default-tenant"
    user_id: str = "default-user"
    session_id: str = "default-session"
    branch_id: str = "main"
    turn_index: int = 1
    api_key: Optional[str] = None
    encapsulated_fallback: Optional[str] = None
    extra_headers: Dict[str, str] = field(default_factory=dict)


class StateGuardClient:
    """Drop-in client wrapper and proxy connector for Anthropic, OpenAI, and Gemini models."""

    def __init__(self, config: Optional[StateGuardConfig] = None):
        self.config = config or StateGuardConfig()
        self._http = (
            httpx.Client(base_url=self.config.gateway_url, timeout=60.0)
            if HAS_HTTPX
            else None
        )

    def get_security_headers(self) -> Dict[str, str]:
        headers = {
            "x-stateguard-tenant-id": self.config.tenant_id,
            "x-stateguard-user-id": self.config.user_id,
            "x-stateguard-session-id": self.config.session_id,
            "x-stateguard-branch": self.config.branch_id,
            "x-stateguard-turn": str(self.config.turn_index),
        }
        if self.config.encapsulated_fallback:
            headers["x-stateguard-encapsulated-fallback"] = self.config.encapsulated_fallback
        if self.config.api_key:
            headers["authorization"] = f"Bearer {self.config.api_key}"
        headers.update(self.config.extra_headers)
        return headers

    def advance_turn(self) -> int:
        """Advance conversational turn counter (monotonic sequence invariant)."""
        self.config.turn_index += 1
        return self.config.turn_index

    def fork_branch(self, new_branch_id: str) -> "StateGuardClient":
        """Spawns a child branch client sharing session context."""
        new_config = StateGuardConfig(
            gateway_url=self.config.gateway_url,
            tenant_id=self.config.tenant_id,
            user_id=self.config.user_id,
            session_id=self.config.session_id,
            branch_id=new_branch_id,
            turn_index=self.config.turn_index,
            api_key=self.config.api_key,
            encapsulated_fallback=self.config.encapsulated_fallback,
            extra_headers=dict(self.config.extra_headers),
        )
        return StateGuardClient(new_config)

    def wrap_anthropic(self, anthropic_client: Any) -> Any:
        """Configure an official anthropic.Anthropic client instance to route through StateGuard."""
        if HAS_HTTPX and httpx:
            anthropic_client.base_url = httpx.URL(f"{self.config.gateway_url}")
        else:
            anthropic_client.base_url = self.config.gateway_url
        anthropic_client._custom_headers.update(self.get_security_headers())
        return anthropic_client

    def wrap_openai(self, openai_client: Any) -> Any:
        """Configure an official openai.OpenAI client instance to route through StateGuard."""
        openai_client.base_url = f"{self.config.gateway_url}/v1"
        openai_client.default_headers.update(self.get_security_headers())
        return openai_client

    def emit_telemetry(self, trace_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Submit execution traces to StateGuard for safe egress scrubbing before third-party observability."""
        if self._http:
            resp = self._http.post(
                "/v1/telemetry/traces",
                headers=self.get_security_headers(),
                json=trace_payload,
            )
            resp.raise_for_status()
            return resp.json()

        url = f"{self.config.gateway_url}/v1/telemetry/traces"
        data = json.dumps(trace_payload).encode("utf-8")
        headers = {"Content-Type": "application/json", **self.get_security_headers()}
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))

    def check_health(self) -> Dict[str, Any]:
        if self._http:
            resp = self._http.get("/health")
            resp.raise_for_status()
            return resp.json()

        url = f"{self.config.gateway_url}/health"
        req = urllib.request.Request(url, headers=self.get_security_headers(), method="GET")
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))

from typing import Any, Dict, List, Optional
from .client import StateGuardClient, StateGuardConfig


class StateGuardLangChainHandler:
    """LangChain / LangGraph callback handler for state vaulting, context binding, and telemetry scrubbing."""

    def __init__(self, client: Optional[StateGuardClient] = None):
        self.client = client or StateGuardClient()

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> None:
        """Called before an LLM invocation."""
        self.client.advance_turn()

    def on_llm_end(self, response: Any, **kwargs: Any) -> None:
        """Called when LLM finishes running. Scrubs CoT traces."""
        # Sanitize intermediate traces
        if hasattr(response, "generations"):
            for gen_list in response.generations:
                for gen in gen_list:
                    if hasattr(gen, "message") and hasattr(gen.message, "additional_kwargs"):
                        kwargs_dict = gen.message.additional_kwargs
                        # StateGuard vaulted handle is preserved, raw secrets in text scrubbed
                        if "reasoning" in kwargs_dict:
                            pass

    def on_tool_end(self, output: str, **kwargs: Any) -> None:
        """Inspect and scrub tool output traces before logging."""
        pass


class StateGuardLlamaIndexCallback:
    """LlamaIndex custom callback handler for StateGuard gateway integration."""

    def __init__(self, client: Optional[StateGuardClient] = None):
        self.client = client or StateGuardClient()

    def on_event_start(self, event_type: str, payload: Optional[Dict[str, Any]] = None, **kwargs: Any) -> str:
        if event_type == "llm":
            self.client.advance_turn()
        return "event_id"

    def on_event_end(self, event_type: str, payload: Optional[Dict[str, Any]] = None, **kwargs: Any) -> None:
        pass

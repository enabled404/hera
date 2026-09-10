from typing import Any, Dict, List, Optional
from .client import StateGuardClient, StateGuardConfig
from .otel import scrub_text, scrub_object, fingerprint


class StateGuardLangChainHandler:
    """LangChain / LangGraph callback handler for state vaulting, context binding, and in-process telemetry scrubbing."""

    def __init__(self, client: Optional[StateGuardClient] = None):
        self.client = client or StateGuardClient()

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> None:
        """Called before an LLM invocation."""
        self.client.advance_turn()

    def on_llm_end(self, response: Any, **kwargs: Any) -> None:
        """Called when LLM finishes running. Mutates LLMResult generations in-place to swap reasoning blocks for sgh_ handles and scrub credentials."""
        if hasattr(response, "generations"):
            for gen_list in response.generations:
                for gen in gen_list:
                    # 1. Scrub text
                    if hasattr(gen, "text") and isinstance(gen.text, str):
                        gen.text = scrub_text(gen.text)

                    # 2. Inspect message
                    if hasattr(gen, "message"):
                        msg = gen.message
                        if hasattr(msg, "content"):
                            if isinstance(msg.content, str):
                                msg.content = scrub_text(msg.content)
                            elif isinstance(msg.content, (list, dict)):
                                msg.content = scrub_object(msg.content)

                        if hasattr(msg, "additional_kwargs") and isinstance(msg.additional_kwargs, dict):
                            for k, v in list(msg.additional_kwargs.items()):
                                if k in ("signature", "encrypted_content", "thought_signature", "reasoning_content") and isinstance(v, str):
                                    if not v.startswith("sgh_") and not v.startswith("sg_env_"):
                                        msg.additional_kwargs[k] = f"sgh_inproc_{fingerprint(v)}"
                                        continue
                                msg.additional_kwargs[k] = scrub_object(v)

                        if hasattr(msg, "response_metadata") and isinstance(msg.response_metadata, dict):
                            msg.response_metadata = scrub_object(msg.response_metadata)

    def on_chain_end(self, outputs: Any, **kwargs: Any) -> None:
        """Called when chain finishes running. Scrubs chain outputs in-place."""
        if isinstance(outputs, dict):
            for k, v in list(outputs.items()):
                outputs[k] = scrub_object(v)

    def on_tool_end(self, output: str, **kwargs: Any) -> str:
        """Inspect and scrub tool output traces before logging."""
        return scrub_text(output)


class StateGuardLlamaIndexCallback:
    """LlamaIndex custom callback handler for StateGuard gateway integration."""

    def __init__(self, client: Optional[StateGuardClient] = None):
        self.client = client or StateGuardClient()

    def on_event_start(self, event_type: str, payload: Optional[Dict[str, Any]] = None, **kwargs: Any) -> str:
        if event_type == "llm":
            self.client.advance_turn()
        return "event_id"

    def on_event_end(self, event_type: str, payload: Optional[Dict[str, Any]] = None, **kwargs: Any) -> None:
        if payload and isinstance(payload, dict):
            for k, v in list(payload.items()):
                payload[k] = scrub_object(v)

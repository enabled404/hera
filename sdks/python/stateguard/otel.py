import re
import hashlib
import json
from typing import Any, Dict, Optional, Union

try:
    from opentelemetry.sdk.trace import SpanProcessor
    from opentelemetry.trace import Span
except ImportError:
    class SpanProcessor:  # type: ignore
        """Fallback base class when opentelemetry-sdk is not installed."""
        def on_start(self, span: Any, parent_context: Optional[Any] = None) -> None:
            pass
        def on_end(self, span: Any) -> None:
            pass
        def shutdown(self) -> None:
            pass
        def force_flush(self, timeout_millis: int = 30000) -> bool:
            return True

    class Span:  # type: ignore
        pass

SECRET_PATTERNS = [
    (re.compile(r"sk-ant-[a-zA-Z0-9_\-]{20,}"), "ANTHROPIC_KEY"),
    (re.compile(r"sk-[a-zA-Z0-9_\-]{20,}"), "OPENAI_KEY"),
    (re.compile(r"AIza[0-9A-Za-z\-_]{35}"), "GEMINI_KEY"),
    (re.compile(r"ghp_[a-zA-Z0-9]{36}"), "GITHUB_TOKEN"),
    (re.compile(r"AKIA[0-9A-Z]{16}"), "AWS_ACCESS_KEY"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "PRIVATE_KEY"),
    (re.compile(r"postgres(?:ql)?://[^\s\"']+"), "DATABASE_URL"),
]

SIG_PATTERNS = [
    re.compile(r'"signature"\s*:\s*"([^"]+)"'),
    re.compile(r'"encrypted_content"\s*:\s*"([^"]+)"'),
    re.compile(r'"thought_signature"\s*:\s*"([^"]+)"'),
]


def fingerprint(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:8]


def scrub_text(text: str) -> str:
    """Sanitizes text by masking credentials and replacing raw reasoning envelopes."""
    result = text
    # 1. Scrub credentials
    for pattern, kind in SECRET_PATTERNS:
        matches = list(pattern.finditer(result))
        for m in reversed(matches):
            fp = fingerprint(m.group(0))
            mask = f"[REDACTED:{kind}:{fp}]"
            result = result[:m.start()] + mask + result[m.end():]

    # 2. Scrub raw signatures
    for pattern in SIG_PATTERNS:
        matches = list(pattern.finditer(result))
        for m in reversed(matches):
            raw_sig = m.group(1)
            if not raw_sig.startswith("sgh_") and not raw_sig.startswith("sg_env_"):
                handle = f"sgh_inproc_{fingerprint(raw_sig)}"
                prefix = m.group(0).split(":")[0]
                result = result[:m.start()] + f'{prefix}: "{handle}"' + result[m.end():]

    return result


def scrub_object(obj: Any) -> Any:
    """Recursively scrub strings in dicts, lists, and primitives."""
    if isinstance(obj, str):
        return scrub_text(obj)
    elif isinstance(obj, dict):
        new_dict = {}
        for k, v in obj.items():
            if k in ("signature", "encrypted_content", "thought_signature") and isinstance(v, str):
                if not v.startswith("sgh_") and not v.startswith("sg_env_"):
                    new_dict[k] = f"sgh_inproc_{fingerprint(v)}"
                    continue
            new_dict[k] = scrub_object(v)
        return new_dict
    elif isinstance(obj, list):
        return [scrub_object(item) for item in obj]
    return obj


class StateGuardSanitizingSpanProcessor(SpanProcessor):
    """
    OpenTelemetry SpanProcessor that intercepts span attributes (gen_ai.prompt,
    gen_ai.completion, llm.output, etc.) and mutates them in-place,
    stripping credentials and raw reasoning envelopes before export.
    """

    TARGET_ATTRIBUTES = {
        "gen_ai.prompt",
        "gen_ai.completion",
        "llm.output",
        "llm.input",
        "gen_ai.request.headers",
        "gen_ai.response.headers",
        "traceloop.entity.input",
        "traceloop.entity.output",
    }

    def __init__(self, next_processor: Optional[SpanProcessor] = None):
        self.next_processor = next_processor

    def on_start(self, span: Any, parent_context: Optional[Any] = None) -> None:
        if self.next_processor:
            self.next_processor.on_start(span, parent_context)

    def on_end(self, span: Any) -> None:
        """Inspect and scrub span attributes in-memory."""
        attributes = getattr(span, "attributes", None)
        if attributes is None:
            attributes = getattr(span, "_attributes", None)

        if isinstance(attributes, dict):
            for key, val in list(attributes.items()):
                if isinstance(val, str):
                    attributes[key] = scrub_text(val)
                elif isinstance(val, (dict, list)):
                    attributes[key] = scrub_object(val)

        if self.next_processor:
            self.next_processor.on_end(span)

    def shutdown(self) -> None:
        if self.next_processor:
            self.next_processor.shutdown()

    def force_flush(self, timeout_millis: int = 30000) -> bool:
        if self.next_processor:
            return self.next_processor.force_flush(timeout_millis)
        return True

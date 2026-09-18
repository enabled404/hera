import unittest
from stateguard.client import StateGuardClient, StateGuardConfig
from stateguard.otel import StateGuardSanitizingSpanProcessor, scrub_text, scrub_object
from stateguard.middleware import StateGuardLangChainHandler


class MockSpan:
    def __init__(self, attributes=None):
        self.attributes = attributes or {}


class MockGeneration:
    def __init__(self, text, message=None):
        self.text = text
        self.message = message


class MockMessage:
    def __init__(self, content, additional_kwargs=None):
        self.content = content
        self.additional_kwargs = additional_kwargs or {}


class MockLLMResult:
    def __init__(self, generations):
        self.generations = generations


class TestStateGuardSdk(unittest.TestCase):
    def test_config_and_security_headers(self):
        config = StateGuardConfig(
            gateway_url="http://localhost:8080",
            tenant_id="tenant-acme",
            user_id="user-42",
            session_id="sess-99",
            branch_id="feature-tree",
            turn_index=1,
            api_key="sg_live_secret",
            encapsulated_fallback="fb_token_123",
        )
        client = StateGuardClient(config)

        headers = client.get_security_headers()
        self.assertEqual(headers["x-stateguard-tenant-id"], "tenant-acme")
        self.assertEqual(headers["x-stateguard-user-id"], "user-42")
        self.assertEqual(headers["x-stateguard-session-id"], "sess-99")
        self.assertEqual(headers["x-stateguard-branch"], "feature-tree")
        self.assertEqual(headers["x-stateguard-turn"], "1")
        self.assertEqual(headers["x-stateguard-encapsulated-fallback"], "fb_token_123")
        self.assertEqual(headers["authorization"], "Bearer sg_live_secret")

    def test_monotonic_turn_advancement(self):
        client = StateGuardClient()
        self.assertEqual(client.config.turn_index, 1)

        t2 = client.advance_turn()
        self.assertEqual(t2, 2)
        self.assertEqual(client.get_security_headers()["x-stateguard-turn"], "2")

        t3 = client.advance_turn()
        self.assertEqual(t3, 3)
        self.assertEqual(client.get_security_headers()["x-stateguard-turn"], "3")

    def test_fork_branch(self):
        client = StateGuardClient(StateGuardConfig(session_id="session-root", branch_id="main", turn_index=2))
        child_client = client.fork_branch("branch-alpha")
        self.assertEqual(child_client.config.session_id, "session-root")
        self.assertEqual(child_client.config.branch_id, "branch-alpha")
        self.assertEqual(child_client.config.turn_index, 2)
        self.assertEqual(child_client.get_security_headers()["x-stateguard-branch"], "branch-alpha")

    def test_otel_span_processor_scrubbing(self):
        processor = StateGuardSanitizingSpanProcessor()
        span = MockSpan({
            "gen_ai.prompt": "Call API with sk-ant-api03-abcdefghijklmnopqrstuvwxyz12345",
            "gen_ai.completion": 'Result: {"signature": "raw_provider_signature_blob_abc123"}',
            "llm.output": "Secret key sk-12345678901234567890abcdef here",
        })

        processor.on_end(span)
        # Verify API keys scrubbed
        self.assertNotIn("sk-ant-api03-abcdefghijklmnopqrstuvwxyz12345", span.attributes["gen_ai.prompt"])
        self.assertIn("[REDACTED:ANTHROPIC_KEY:", span.attributes["gen_ai.prompt"])
        self.assertNotIn("sk-12345678901234567890abcdef", span.attributes["llm.output"])
        self.assertIn("[REDACTED:OPENAI_KEY:", span.attributes["llm.output"])
        # Verify raw reasoning signature replaced with sgh_ handle
        self.assertNotIn("raw_provider_signature_blob_abc123", span.attributes["gen_ai.completion"])
        self.assertIn("sgh_inproc_", span.attributes["gen_ai.completion"])

    def test_langchain_handler_in_place_mutation(self):
        handler = StateGuardLangChainHandler()
        msg = MockMessage(
            content="Plan execution complete with key sk-ant-sec12345678901234567890",
            additional_kwargs={"signature": "raw_anthropic_signature_to_vault"},
        )
        gen = MockGeneration(text="raw response text with sk-98765432109876543210zyx", message=msg)
        result = MockLLMResult(generations=[[gen]])

        handler.on_llm_end(result)
        self.assertNotIn("raw_anthropic_signature_to_vault", msg.additional_kwargs["signature"])
        self.assertTrue(msg.additional_kwargs["signature"].startswith("sgh_inproc_"))
        self.assertNotIn("sk-ant-sec12345678901234567890", msg.content)
        self.assertNotIn("sk-98765432109876543210zyx", gen.text)


if __name__ == "__main__":
    unittest.main()

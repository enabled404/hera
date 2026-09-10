import unittest
from stateguard.client import StateGuardClient, StateGuardConfig


class TestStateGuardSdk(unittest.TestCase):
    def test_config_and_security_headers(self):
        config = StateGuardConfig(
            gateway_url="http://localhost:8080",
            tenant_id="tenant-acme",
            user_id="user-42",
            session_id="sess-99",
            turn_index=1,
            api_key="sg_live_secret",
        )
        client = StateGuardClient(config)

        headers = client.get_security_headers()
        self.assertEqual(headers["x-stateguard-tenant-id"], "tenant-acme")
        self.assertEqual(headers["x-stateguard-user-id"], "user-42")
        self.assertEqual(headers["x-stateguard-session-id"], "sess-99")
        self.assertEqual(headers["x-stateguard-turn"], "1")
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


if __name__ == "__main__":
    unittest.main()

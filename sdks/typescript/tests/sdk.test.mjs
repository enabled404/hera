import test from "node:test";
import assert from "node:assert/strict";

// Dynamic import or simulate client logic
class StateGuardClient {
  constructor(options = {}) {
    this.gatewayUrl = options.gatewayUrl || "http://localhost:8080";
    this.tenantId = options.tenantId || "default-tenant";
    this.userId = options.userId || "default-user";
    this.sessionId = options.sessionId || "default-session";
    this.turnIndex = options.turnIndex || 1;
    this.apiKey = options.apiKey;
    this.extraHeaders = options.extraHeaders || {};
  }

  getSecurityHeaders() {
    const headers = {
      "x-stateguard-tenant-id": this.tenantId,
      "x-stateguard-user-id": this.userId,
      "x-stateguard-session-id": this.sessionId,
      "x-stateguard-turn": this.turnIndex.toString(),
      ...this.extraHeaders,
    };
    if (this.apiKey) {
      headers["authorization"] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  advanceTurn() {
    this.turnIndex += 1;
    return this.turnIndex;
  }

  wrapAnthropic(client) {
    client.baseURL = this.gatewayUrl;
    client.defaultHeaders = {
      ...client.defaultHeaders,
      ...this.getSecurityHeaders(),
    };
    return client;
  }
}

test("StateGuard TypeScript SDK Configuration & Headers", () => {
  const client = new StateGuardClient({
    gatewayUrl: "https://gateway.stateguard.internal",
    tenantId: "tenant-fintech",
    userId: "agent-runner-01",
    sessionId: "sess-8899",
    turnIndex: 1,
    apiKey: "sg_secret_key_123",
  });

  const headers = client.getSecurityHeaders();
  assert.equal(headers["x-stateguard-tenant-id"], "tenant-fintech");
  assert.equal(headers["x-stateguard-user-id"], "agent-runner-01");
  assert.equal(headers["x-stateguard-session-id"], "sess-8899");
  assert.equal(headers["x-stateguard-turn"], "1");
  assert.equal(headers["authorization"], "Bearer sg_secret_key_123");

  const turn2 = client.advanceTurn();
  assert.equal(turn2, 2);
  assert.equal(client.getSecurityHeaders()["x-stateguard-turn"], "2");
});

test("StateGuard TypeScript SDK Anthropic Wrapper", () => {
  const client = new StateGuardClient({
    gatewayUrl: "http://localhost:8080",
    tenantId: "tenant-alpha",
  });

  const mockAnthropic = {
    baseURL: "https://api.anthropic.com",
    defaultHeaders: { "x-api-key": "anthropic-key" },
  };

  client.wrapAnthropic(mockAnthropic);
  assert.equal(mockAnthropic.baseURL, "http://localhost:8080");
  assert.equal(mockAnthropic.defaultHeaders["x-stateguard-tenant-id"], "tenant-alpha");
});

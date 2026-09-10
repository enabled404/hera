import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

function fingerprint(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 8);
}

const SECRET_PATTERNS = [
  [/sk-ant-[a-zA-Z0-9_-]{20,}/g, "ANTHROPIC_KEY"],
  [/sk-[a-zA-Z0-9_-]{20,}/g, "OPENAI_KEY"],
  [/AIza[0-9A-Za-z\-_]{35}/g, "GEMINI_KEY"],
  [/ghp_[a-zA-Z0-9]{36}/g, "GITHUB_TOKEN"],
  [/AKIA[0-9A-Z]{16}/g, "AWS_ACCESS_KEY"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, "PRIVATE_KEY"],
  [/postgres(?:ql)?:\/\/[^\s"']+/g, "DATABASE_URL"],
];

const SIG_PATTERNS = [
  /"signature"\s*:\s*"([^"]+)"/g,
  /"encrypted_content"\s*:\s*"([^"]+)"/g,
  /"thought_signature"\s*:\s*"([^"]+)"/g,
];

function scrubText(text) {
  let result = text;
  for (const [pattern, kind] of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, (match) => {
      const fp = fingerprint(match);
      return `[REDACTED:${kind}:${fp}]`;
    });
  }
  for (const pattern of SIG_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, (match, rawSig) => {
      if (!rawSig.startsWith("sgh_") && !rawSig.startsWith("sg_env_")) {
        const handle = `sgh_inproc_${fingerprint(rawSig)}`;
        const key = match.split(":")[0];
        return `${key}: "${handle}"`;
      }
      return match;
    });
  }
  return result;
}

function scrubObject(obj) {
  if (typeof obj === "string") return scrubText(obj);
  if (Array.isArray(obj)) return obj.map((item) => scrubObject(item));
  if (obj !== null && typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        (key === "signature" || key === "encrypted_content" || key === "thought_signature") &&
        typeof value === "string"
      ) {
        if (!value.startsWith("sgh_") && !value.startsWith("sg_env_")) {
          result[key] = `sgh_inproc_${fingerprint(value)}`;
          continue;
        }
      }
      result[key] = scrubObject(value);
    }
    return result;
  }
  return obj;
}

class StateGuardClient {
  constructor(options = {}) {
    this.gatewayUrl = options.gatewayUrl || "http://localhost:8080";
    this.tenantId = options.tenantId || "default-tenant";
    this.userId = options.userId || "default-user";
    this.sessionId = options.sessionId || "default-session";
    this.branchId = options.branchId || "main";
    this.turnIndex = options.turnIndex || 1;
    this.apiKey = options.apiKey;
    this.encapsulatedFallback = options.encapsulatedFallback;
    this.extraHeaders = options.extraHeaders || {};
  }

  getSecurityHeaders() {
    const headers = {
      "x-stateguard-tenant-id": this.tenantId,
      "x-stateguard-user-id": this.userId,
      "x-stateguard-session-id": this.sessionId,
      "x-stateguard-branch": this.branchId,
      "x-stateguard-turn": this.turnIndex.toString(),
      ...this.extraHeaders,
    };
    if (this.encapsulatedFallback) {
      headers["x-stateguard-encapsulated-fallback"] = this.encapsulatedFallback;
    }
    if (this.apiKey) {
      headers["authorization"] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  advanceTurn() {
    this.turnIndex += 1;
    return this.turnIndex;
  }

  forkBranch(newBranchId) {
    return new StateGuardClient({
      gatewayUrl: this.gatewayUrl,
      tenantId: this.tenantId,
      userId: this.userId,
      sessionId: this.sessionId,
      branchId: newBranchId,
      turnIndex: this.turnIndex,
      apiKey: this.apiKey,
      encapsulatedFallback: this.encapsulatedFallback,
      extraHeaders: { ...this.extraHeaders },
    });
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

class StateGuardSanitizingSpanProcessor {
  constructor(nextProcessor) {
    this.nextProcessor = nextProcessor;
  }

  onEnd(span) {
    const attributes = span.attributes || span._attributes;
    if (attributes && typeof attributes === "object") {
      for (const [key, val] of Object.entries(attributes)) {
        if (typeof val === "string") {
          attributes[key] = scrubText(val);
        } else if (val !== null && typeof val === "object") {
          attributes[key] = scrubObject(val);
        }
      }
    }
    if (this.nextProcessor?.onEnd) {
      this.nextProcessor.onEnd(span);
    }
  }
}

class StateGuardLangChainCallbackHandler {
  constructor(client) {
    this.client = client || new StateGuardClient();
  }

  handleLLMStart() {
    this.client.advanceTurn();
  }

  handleLLMEnd(output) {
    if (output && Array.isArray(output.generations)) {
      for (const genList of output.generations) {
        for (const gen of genList) {
          if (typeof gen.text === "string") {
            gen.text = scrubText(gen.text);
          }
          if (gen.message) {
            if (typeof gen.message.content === "string") {
              gen.message.content = scrubText(gen.message.content);
            }
            if (gen.message.additional_kwargs && typeof gen.message.additional_kwargs === "object") {
              const kw = gen.message.additional_kwargs;
              for (const [k, v] of Object.entries(kw)) {
                if (
                  (k === "signature" || k === "encrypted_content" || k === "thought_signature") &&
                  typeof v === "string"
                ) {
                  if (!v.startsWith("sgh_") && !v.startsWith("sg_env_")) {
                    kw[k] = `sgh_inproc_${fingerprint(v)}`;
                    continue;
                  }
                }
                kw[k] = scrubObject(v);
              }
            }
          }
        }
      }
    }
  }
}

test("StateGuard TypeScript SDK Configuration & Headers", () => {
  const client = new StateGuardClient({
    gatewayUrl: "https://gateway.stateguard.internal",
    tenantId: "tenant-fintech",
    userId: "agent-runner-01",
    sessionId: "sess-8899",
    branchId: "branch-tot-1",
    turnIndex: 1,
    apiKey: "sg_secret_key_123",
    encapsulatedFallback: "token_fallback_xyz",
  });

  const headers = client.getSecurityHeaders();
  assert.equal(headers["x-stateguard-tenant-id"], "tenant-fintech");
  assert.equal(headers["x-stateguard-user-id"], "agent-runner-01");
  assert.equal(headers["x-stateguard-session-id"], "sess-8899");
  assert.equal(headers["x-stateguard-branch"], "branch-tot-1");
  assert.equal(headers["x-stateguard-turn"], "1");
  assert.equal(headers["x-stateguard-encapsulated-fallback"], "token_fallback_xyz");
  assert.equal(headers["authorization"], "Bearer sg_secret_key_123");

  const turn2 = client.advanceTurn();
  assert.equal(turn2, 2);
  assert.equal(client.getSecurityHeaders()["x-stateguard-turn"], "2");
});

test("StateGuard TypeScript SDK Branch Forking", () => {
  const client = new StateGuardClient({
    sessionId: "root-tree",
    branchId: "main",
    turnIndex: 3,
  });

  const forked = client.forkBranch("child-alpha");
  assert.equal(forked.sessionId, "root-tree");
  assert.equal(forked.branchId, "child-alpha");
  assert.equal(forked.turnIndex, 3);
  assert.equal(forked.getSecurityHeaders()["x-stateguard-branch"], "child-alpha");
});

test("StateGuard TypeScript SDK OpenTelemetry Span Scrubbing", () => {
  const processor = new StateGuardSanitizingSpanProcessor();
  const span = {
    attributes: {
      "gen_ai.prompt": "Prompt with sk-ant-api03-abcdefghijklmnopqrstuvwxyz12345 secret key",
      "gen_ai.completion": '{"signature": "raw_provider_signature_to_scrub"}',
      "llm.output": "Found AWS key AKIA1234567890ABCDEF in trace",
    },
  };

  processor.onEnd(span);
  assert.ok(!span.attributes["gen_ai.prompt"].includes("sk-ant-api03-abcdefghijklmnopqrstuvwxyz12345"));
  assert.ok(span.attributes["gen_ai.prompt"].includes("[REDACTED:ANTHROPIC_KEY:"));
  assert.ok(!span.attributes["llm.output"].includes("AKIA1234567890ABCDEF"));
  assert.ok(span.attributes["llm.output"].includes("[REDACTED:AWS_ACCESS_KEY:"));
  assert.ok(!span.attributes["gen_ai.completion"].includes("raw_provider_signature_to_scrub"));
  assert.ok(span.attributes["gen_ai.completion"].includes("sgh_inproc_"));
});

test("StateGuard TypeScript SDK LangChain In-Place Mutation", () => {
  const handler = new StateGuardLangChainCallbackHandler();
  const output = {
    generations: [
      [
        {
          text: "Response with sk-abcdef1234567890abcdef",
          message: {
            content: "Safe content",
            additional_kwargs: {
              signature: "raw_signature_to_substitute",
            },
          },
        },
      ],
    ],
  };

  handler.handleLLMEnd(output);
  const gen = output.generations[0][0];
  assert.ok(!gen.text.includes("sk-abcdef1234567890abcdef"));
  assert.ok(gen.message.additional_kwargs.signature.startsWith("sgh_inproc_"));
});

import { createHash } from "node:crypto";

export interface SpanLike {
  attributes?: Record<string, unknown>;
  _attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SpanProcessorLike {
  onStart?(span: SpanLike, parentContext?: unknown): void;
  onEnd?(span: SpanLike): void;
  shutdown?(): Promise<void> | void;
  forceFlush?(): Promise<void> | void;
}

const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/sk-ant-[a-zA-Z0-9_-]{20,}/g, "ANTHROPIC_KEY"],
  [/sk-[a-zA-Z0-9_-]{20,}/g, "OPENAI_KEY"],
  [/AIza[0-9A-Za-z\-_]{35}/g, "GEMINI_KEY"],
  [/ghp_[a-zA-Z0-9]{36}/g, "GITHUB_TOKEN"],
  [/AKIA[0-9A-Z]{16}/g, "AWS_ACCESS_KEY"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, "PRIVATE_KEY"],
  [/postgres(?:ql)?:\/\/[^\s"']+/g, "DATABASE_URL"],
];

const SIG_PATTERNS: RegExp[] = [
  /"signature"\s*:\s*"([^"]+)"/g,
  /"encrypted_content"\s*:\s*"([^"]+)"/g,
  /"thought_signature"\s*:\s*"([^"]+)"/g,
];

export function fingerprint(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 8);
}

export function scrubText(text: string): string {
  let result = text;

  // 1. Scrub credentials
  for (const [pattern, kind] of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, (match) => {
      const fp = fingerprint(match);
      return `[REDACTED:${kind}:${fp}]`;
    });
  }

  // 2. Scrub reasoning signatures
  for (const pattern of SIG_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, (match, rawSig: string) => {
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

export function scrubObject<T>(obj: T): T {
  if (typeof obj === "string") {
    return scrubText(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => scrubObject(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
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
    return result as unknown as T;
  }
  return obj;
}

export class StateGuardSanitizingSpanProcessor implements SpanProcessorLike {
  private nextProcessor?: SpanProcessorLike;

  constructor(nextProcessor?: SpanProcessorLike) {
    this.nextProcessor = nextProcessor;
  }

  public onStart(span: SpanLike, parentContext?: unknown): void {
    if (this.nextProcessor?.onStart) {
      this.nextProcessor.onStart(span, parentContext);
    }
  }

  public onEnd(span: SpanLike): void {
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

  public async shutdown(): Promise<void> {
    if (this.nextProcessor?.shutdown) {
      await this.nextProcessor.shutdown();
    }
  }

  public async forceFlush(): Promise<void> {
    if (this.nextProcessor?.forceFlush) {
      await this.nextProcessor.forceFlush();
    }
  }
}

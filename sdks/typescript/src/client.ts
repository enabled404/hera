export interface StateGuardOptions {
  gatewayUrl?: string;
  tenantId?: string;
  userId?: string;
  sessionId?: string;
  turnIndex?: number;
  apiKey?: string;
  extraHeaders?: Record<string, string>;
}

export class StateGuardClient {
  public gatewayUrl: string;
  public tenantId: string;
  public userId: string;
  public sessionId: string;
  public turnIndex: number;
  public apiKey?: string;
  public extraHeaders: Record<string, string>;

  constructor(options: StateGuardOptions = {}) {
    this.gatewayUrl = options.gatewayUrl || "http://localhost:8080";
    this.tenantId = options.tenantId || "default-tenant";
    this.userId = options.userId || "default-user";
    this.sessionId = options.sessionId || "default-session";
    this.turnIndex = options.turnIndex || 1;
    this.apiKey = options.apiKey;
    this.extraHeaders = options.extraHeaders || {};
  }

  public getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
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

  public advanceTurn(): number {
    this.turnIndex += 1;
    return this.turnIndex;
  }

  /**
   * Wrap an Anthropic client instance to route through StateGuard Gateway
   */
  public wrapAnthropic<T extends { baseURL?: string; defaultHeaders?: Record<string, string> }>(
    anthropicClient: T
  ): T {
    anthropicClient.baseURL = this.gatewayUrl;
    anthropicClient.defaultHeaders = {
      ...anthropicClient.defaultHeaders,
      ...this.getSecurityHeaders(),
    };
    return anthropicClient;
  }

  /**
   * Wrap an OpenAI client instance to route through StateGuard Gateway
   */
  public wrapOpenAI<T extends { baseURL?: string; defaultHeaders?: Record<string, string> }>(
    openaiClient: T
  ): T {
    openaiClient.baseURL = `${this.gatewayUrl}/v1`;
    openaiClient.defaultHeaders = {
      ...openaiClient.defaultHeaders,
      ...this.getSecurityHeaders(),
    };
    return openaiClient;
  }

  /**
   * Send telemetry execution traces to StateGuard for safe egress scrubbing
   */
  public async emitTelemetry(tracePayload: Record<string, unknown>): Promise<unknown> {
    const res = await fetch(`${this.gatewayUrl}/v1/telemetry/traces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getSecurityHeaders(),
      },
      body: JSON.stringify(tracePayload),
    });

    if (!res.ok) {
      throw new Error(`StateGuard telemetry egress failed with HTTP ${res.status}`);
    }

    return res.json();
  }
}

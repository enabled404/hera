import { StateGuardClient } from "./client.js";
import { scrubObject, scrubText, fingerprint } from "./otel.js";

/**
 * Vercel AI SDK middleware / callback wrapper for StateGuard
 */
export function createStateGuardAiMiddleware(client: StateGuardClient) {
  return {
    transformParams: (params: Record<string, unknown>) => {
      client.advanceTurn();
      return {
        ...params,
        headers: {
          ...((params.headers as Record<string, string>) || {}),
          ...client.getSecurityHeaders(),
        },
      };
    },
    transformResponse: (response: unknown) => {
      return scrubObject(response);
    },
  };
}

/**
 * LangChain / LangGraph callback handler for state vaulting and in-process trace scrubbing
 */
export class StateGuardLangChainCallbackHandler {
  public client: StateGuardClient;

  constructor(client?: StateGuardClient) {
    this.client = client || new StateGuardClient();
  }

  public handleLLMStart(): void {
    this.client.advanceTurn();
  }

  public handleLLMEnd(output: { generations: Array<Array<{ text?: string; message?: any }>> }): void {
    if (output && Array.isArray(output.generations)) {
      for (const genList of output.generations) {
        for (const gen of genList) {
          if (typeof gen.text === "string") {
            gen.text = scrubText(gen.text);
          }

          if (gen.message) {
            if (typeof gen.message.content === "string") {
              gen.message.content = scrubText(gen.message.content);
            } else if (gen.message.content && typeof gen.message.content === "object") {
              gen.message.content = scrubObject(gen.message.content);
            }

            if (gen.message.additional_kwargs && typeof gen.message.additional_kwargs === "object") {
              const kw = gen.message.additional_kwargs;
              for (const [k, v] of Object.entries(kw)) {
                if (
                  (k === "signature" || k === "encrypted_content" || k === "thought_signature" || k === "reasoning_content") &&
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

            if (gen.message.response_metadata && typeof gen.message.response_metadata === "object") {
              gen.message.response_metadata = scrubObject(gen.message.response_metadata);
            }
          }
        }
      }
    }
  }

  public handleChainEnd(outputs: Record<string, unknown>): void {
    if (outputs && typeof outputs === "object") {
      for (const [k, v] of Object.entries(outputs)) {
        outputs[k] = scrubObject(v);
      }
    }
  }

  public handleToolEnd(output: string): string {
    return scrubText(output);
  }
}

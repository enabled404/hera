import { StateGuardClient } from "./client.js";

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
          ...(params.headers as Record<string, string> || {}),
          ...client.getSecurityHeaders(),
        },
      };
    },
    transformResponse: (response: unknown) => {
      return response;
    },
  };
}

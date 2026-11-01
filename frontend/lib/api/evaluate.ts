import { apiClient } from "./client";
import type { EvaluateRequest, EvaluateResponse } from "./types";

export const evaluateApi = {
  async evaluate(data: EvaluateRequest, signal?: AbortSignal): Promise<EvaluateResponse> {
    const response = await apiClient.post<EvaluateResponse>("/evaluate/", data, {
      signal,
      // Vision + LLM is slower than the default 15s budget allows for.
      timeout: 30000,
    });
    return response.data;
  },
};

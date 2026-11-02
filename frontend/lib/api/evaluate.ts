import { apiClient } from "./client";
import type { EvaluateRequest, EvaluateResponse } from "./types";

export const evaluateApi = {
  async evaluate(data: EvaluateRequest, signal?: AbortSignal): Promise<EvaluateResponse> {
    // vision + LLM is slower than the default 15s timeout
    const response = await apiClient.post<EvaluateResponse>("/evaluate", data, { signal, timeout: 60000 });
    return response.data;
  },
};

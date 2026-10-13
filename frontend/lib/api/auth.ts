import { apiClient } from "./client";
import type {
  AuthResponse,
  MeResponse,
  MessageResponse,
  SigninPayload,
  SignupPayload,
} from "./types";

export const authApi = {
  async signup(data: SignupPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/signup/", data);
    return response.data;
  },

  async signin(data: SigninPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/signin/", data);
    return response.data;
  },

  async getMe(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>("/auth/me/");
    return response.data;
  },

  async logout(): Promise<MessageResponse> {
    try {
      const response = await apiClient.post<MessageResponse>("/auth/logout/");
      return response.data;
    } catch {
      // Fallback to GET if server only supports GET
      const response = await apiClient.get<MessageResponse>("/auth/logout/");
      return response.data;
    }
  },
};

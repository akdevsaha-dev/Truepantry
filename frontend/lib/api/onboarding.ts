import { apiClient } from "./client";
import type {
  CompleteOnboardingResponse,
  GoalStepPayload,
  OnboardingStatusResponse,
  PreferencesStepPayload,
  ProfileStepPayload,
} from "./types";

export const onboardingApi = {
  async getStatus(): Promise<OnboardingStatusResponse> {
    const response = await apiClient.get<OnboardingStatusResponse>("/onboarding/");
    return response.data;
  },

  async updateProfile(data: ProfileStepPayload): Promise<unknown> {
    const response = await apiClient.patch("/onboarding/profile/", data);
    return response.data;
  },

  async updateGoals(data: GoalStepPayload): Promise<unknown> {
    const response = await apiClient.patch("/onboarding/goals/", data);
    return response.data;
  },

  async updatePreferences(data: PreferencesStepPayload): Promise<unknown> {
    const response = await apiClient.patch("/onboarding/preferences/", data);
    return response.data;
  },

  async complete(): Promise<CompleteOnboardingResponse> {
    const response = await apiClient.post<CompleteOnboardingResponse>("/onboarding/complete/");
    return response.data;
  },
};

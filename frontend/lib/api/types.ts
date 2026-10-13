export interface User {
  id: string;
  email: string;
  username: string;
  created_at?: string;
  is_onboarded: boolean;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id?: string;
    username?: string;
    email: string;
  };
}

export interface MeResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface OnboardingProfileData {
  dob: string;
  height: number;
  gender: string;
}

export interface OnboardingGoalData {
  goal: string;
}

export interface OnboardingPreferencesData {
  diet: string;
  other_diet?: string | null;
  allergies: string[];
  other_allergy?: string | null;
}

export interface OnboardingStatusResponse {
  onboarding_step: number;
  is_completed: boolean;
  profile: OnboardingProfileData | null;
  goal: OnboardingGoalData | null;
  preferences: OnboardingPreferencesData | null;
}

export interface ProfileStepPayload {
  dob: string;
  height: number;
  gender: string;
}

export interface GoalStepPayload {
  goal: string;
}

export interface PreferencesStepPayload {
  diet: string;
  other_diet?: string | null;
  otherDiet?: string | null;
  allergies: string[];
  other_allergy?: string | null;
  otherAllergy?: string | null;
}

export interface CompleteOnboardingResponse {
  message: string;
  is_completed: boolean;
  redirect_to: string;
}

export interface ApiValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail?: string | ApiValidationErrorDetail[];
  message?: string;
}

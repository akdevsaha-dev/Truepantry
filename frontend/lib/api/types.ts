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

// POST /evaluate/ — one endpoint for every scan. The client sends what it
// has (a barcode, a camera frame, or a label the user confirmed); the backend
// resolves the item, then produces the verdict.
export type EvaluateRequest =
  | { source: "barcode"; barcode: string }
  | { source: "image"; image: string } // base64 JPEG, no data: URL prefix
  | { source: "label"; label: string };

export interface EvaluatedItem {
  name: string;
  brand?: string | null;
  is_packaged: boolean;
  resolved_by: "barcode" | "vision" | "label";
}

export type VerdictLevel = "good" | "caution" | "avoid";

export interface Verdict {
  level: VerdictLevel;
  headline: string;
  spoken: string;
  reasons: string[];
}

export type EvaluateResponse =
  | { status: "ok"; item: EvaluatedItem; verdict: Verdict }
  // Barcode not found in the SKU DB or Open Food Facts: client resends a frame.
  | { status: "needs_image"; message?: string }
  // Vision wasn't sure: client asks "Is this X?" before any verdict.
  | { status: "low_confidence"; guess: string; confidence: number };

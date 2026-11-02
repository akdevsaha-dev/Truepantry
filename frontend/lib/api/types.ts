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

// POST /evaluate — one endpoint for every scan. The client sends what it
// has (a barcode, a camera frame, or a label the user confirmed).
export type EvaluateRequest =
  | { source: "barcode"; barcode: string }
  | { source: "image"; image: string } // base64 JPEG, no data: URL prefix
  | { source: "label"; label: string };

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  is_packaged: boolean;
  image_url: string | null;
  nutri_grade: string | null;
  eco_grade: string | null;
  nova_group: number | null;
  scores_source: "off" | "llm" | null;
}

export type VerdictLevel = "good" | "caution" | "avoid";

export interface Verdict {
  level: VerdictLevel;
  headline: string;
  spoken: string;
  reasons: string[];
}

export type EvaluateResponse =
  | { status: "ok"; item: Product; verdict: Verdict }
  // Barcode not found anywhere: the client sends a camera frame instead.
  | { status: "needs_image"; message?: string }
  // Vision wasn't sure: the client asks "Is this X?" first.
  | { status: "low_confidence"; guess: string; confidence: number };

export interface CartItem {
  id: string;
  quantity: number;
  verdict: Verdict;
  added_at: string;
  products: Product;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  product_id: string | null;
  is_staple: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  ingredients: RecipeIngredient[];
  steps: string[];
  is_favorite: boolean;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

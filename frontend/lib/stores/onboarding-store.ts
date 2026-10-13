import { create } from "zustand";
import { formatApiError } from "../api/client";
import { onboardingApi } from "../api/onboarding";
import { useAuthStore } from "./auth-store";

export interface OnboardingFormState {
  dob: string;
  height: string;
  gender: string;
  goal: string;
  diet: string;
  otherDiet: string;
  allergies: string[];
  otherAllergy: string;
}

export type OnboardingFormField = keyof OnboardingFormState;

interface OnboardingStoreState {
  step: number;
  direction: number;
  profile: OnboardingFormState;
  isCompleted: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchStatus: () => Promise<void>;
  setField: <K extends OnboardingFormField>(field: K, value: OnboardingFormState[K]) => void;
  toggleAllergen: (value: string) => void;
  goToStep: (step: number) => void;
  saveProfileStep: () => Promise<boolean>;
  saveGoalStep: () => Promise<boolean>;
  savePreferencesStep: () => Promise<boolean>;
  completeOnboarding: () => Promise<string>;
  clearError: () => void;
  reset: () => void;
}

const initialProfile: OnboardingFormState = {
  dob: "",
  height: "",
  gender: "",
  goal: "",
  diet: "",
  otherDiet: "",
  allergies: [],
  otherAllergy: "",
};

export const useOnboardingStore = create<OnboardingStoreState>((set, get) => ({
  step: 0,
  direction: 1,
  profile: initialProfile,
  isCompleted: false,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await onboardingApi.getStatus();
      set((state) => ({
        isLoading: false,
        isCompleted: Boolean(data.is_completed),
        step: data.is_completed ? 3 : Math.min(Math.max(data.onboarding_step ?? 0, 0), 2),
        profile: {
          ...state.profile,
          dob: data.profile?.dob || state.profile.dob,
          height: data.profile?.height ? String(data.profile.height) : state.profile.height,
          gender: data.profile?.gender || state.profile.gender,
          goal: data.goal?.goal || state.profile.goal,
          diet: data.preferences?.diet || state.profile.diet,
          otherDiet: data.preferences?.other_diet || state.profile.otherDiet,
          allergies: data.preferences?.allergies && data.preferences.allergies.length > 0
            ? data.preferences.allergies
            : state.profile.allergies,
          otherAllergy: data.preferences?.other_allergy || state.profile.otherAllergy,
        },
      }));
    } catch {
      // If user is not yet logged in or has no onboarding session yet, retain defaults
      set({ isLoading: false });
    }
  },

  setField: (field, value) => {
    set((state) => ({
      profile: { ...state.profile, [field]: value },
      error: null,
    }));
  },

  toggleAllergen: (value: string) => {
    set((state) => {
      const current = state.profile.allergies;
      let next: string[];

      if (value === "None") {
        next = current.includes("None") ? [] : ["None"];
      } else if (current.includes(value)) {
        next = current.filter((item) => item !== value);
      } else {
        next = [...current.filter((item) => item !== "None"), value];
      }

      return {
        profile: { ...state.profile, allergies: next },
        error: null,
      };
    });
  },

  goToStep: (next: number) => {
    set((state) => ({
      direction: next < state.step ? -1 : 1,
      step: next,
      error: null,
    }));
  },

  saveProfileStep: async () => {
    const { profile, step } = get();
    const heightNum = Number(profile.height);

    set({ isSaving: true, error: null });
    try {
      await onboardingApi.updateProfile({
        dob: profile.dob,
        height: heightNum,
        gender: profile.gender,
      });

      set({
        isSaving: false,
        direction: 1,
        step: Math.max(step + 1, 1),
      });
      return true;
    } catch (err) {
      const message = formatApiError(err, "Failed to save profile. Please check your entries.");
      set({ isSaving: false, error: message });
      return false;
    }
  },

  saveGoalStep: async () => {
    const { profile, step } = get();

    set({ isSaving: true, error: null });
    try {
      await onboardingApi.updateGoals({
        goal: profile.goal,
      });

      set({
        isSaving: false,
        direction: 1,
        step: Math.max(step + 1, 2),
      });
      return true;
    } catch (err) {
      const message = formatApiError(err, "Failed to save your goal. Please try again.");
      set({ isSaving: false, error: message });
      return false;
    }
  },

  savePreferencesStep: async () => {
    const { profile } = get();

    set({ isSaving: true, error: null });
    try {
      await onboardingApi.updatePreferences({
        diet: profile.diet,
        other_diet: profile.diet === "Other" ? profile.otherDiet.trim() : null,
        otherDiet: profile.diet === "Other" ? profile.otherDiet.trim() : null,
        allergies: profile.allergies,
        other_allergy: profile.allergies.includes("Other") ? profile.otherAllergy.trim() : null,
        otherAllergy: profile.allergies.includes("Other") ? profile.otherAllergy.trim() : null,
      });

      set({
        isSaving: false,
        direction: 1,
        step: 3, // Move to summary/completion preview
      });
      return true;
    } catch (err) {
      const message = formatApiError(err, "Failed to save dietary preferences. Please try again.");
      set({ isSaving: false, error: message });
      return false;
    }
  },

  completeOnboarding: async () => {
    set({ isSaving: true, error: null });
    try {
      const res = await onboardingApi.complete();
      set({
        isSaving: false,
        isCompleted: true,
      });

      // Update auth store user state if loaded
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        useAuthStore.getState().setUser({
          ...authUser,
          is_onboarded: true,
        });
      }

      return res.redirect_to || "/dashboard";
    } catch (err) {
      const message = formatApiError(err, "Failed to complete onboarding. Please ensure all steps are finished.");
      set({ isSaving: false, error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      step: 0,
      direction: 1,
      profile: initialProfile,
      isCompleted: false,
      isLoading: false,
      isSaving: false,
      error: null,
    }),
}));

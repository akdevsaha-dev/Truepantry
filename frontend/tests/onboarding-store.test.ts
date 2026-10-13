import test from "node:test";
import assert from "node:assert/strict";
import { useOnboardingStore } from "../lib/stores/onboarding-store";
import { useAuthStore } from "../lib/stores/auth-store";
import { onboardingApi } from "../lib/api/onboarding";

test.beforeEach(() => {
  useOnboardingStore.getState().reset();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

test("onboarding store initializes with clean state", () => {
  const state = useOnboardingStore.getState();
  assert.equal(state.step, 0);
  assert.equal(state.isCompleted, false);
  assert.equal(state.isLoading, false);
  assert.equal(state.isSaving, false);
  assert.equal(state.error, null);
  assert.equal(state.profile.dob, "");
  assert.deepEqual(state.profile.allergies, []);
});

test("onboarding setField updates profile and clears error", () => {
  useOnboardingStore.setState({ error: "Previous error" });
  useOnboardingStore.getState().setField("dob", "1995-04-12");
  useOnboardingStore.getState().setField("height", "175");
  useOnboardingStore.getState().setField("gender", "Woman");

  const state = useOnboardingStore.getState();
  assert.equal(state.profile.dob, "1995-04-12");
  assert.equal(state.profile.height, "175");
  assert.equal(state.profile.gender, "Woman");
  assert.equal(state.error, null);
});

test("onboarding toggleAllergen handles None exclusivity correctly", () => {
  const store = useOnboardingStore.getState();

  // Add Milk
  store.toggleAllergen("Milk");
  assert.deepEqual(useOnboardingStore.getState().profile.allergies, ["Milk"]);

  // Add Eggs
  store.toggleAllergen("Eggs");
  assert.deepEqual(useOnboardingStore.getState().profile.allergies, ["Milk", "Eggs"]);

  // Toggle "None": should clear Milk and Eggs
  store.toggleAllergen("None");
  assert.deepEqual(useOnboardingStore.getState().profile.allergies, ["None"]);

  // Adding Soy should remove "None"
  store.toggleAllergen("Soy");
  assert.deepEqual(useOnboardingStore.getState().profile.allergies, ["Soy"]);

  // Toggle Soy again to remove it
  store.toggleAllergen("Soy");
  assert.deepEqual(useOnboardingStore.getState().profile.allergies, []);
});

test("onboarding goToStep adjusts step and direction", () => {
  const store = useOnboardingStore.getState();

  store.goToStep(2);
  assert.equal(useOnboardingStore.getState().step, 2);
  assert.equal(useOnboardingStore.getState().direction, 1);

  store.goToStep(1);
  assert.equal(useOnboardingStore.getState().step, 1);
  assert.equal(useOnboardingStore.getState().direction, -1);
});

test("onboarding saveProfileStep invokes backend and advances step", async () => {
  const originalUpdate = onboardingApi.updateProfile;
  let sentData: unknown = null;

  onboardingApi.updateProfile = async (payload) => {
    sentData = payload;
    return { message: "Profile step saved successfully", step: 0, next_step: 1 };
  };

  try {
    useOnboardingStore.getState().setField("dob", "1990-01-01");
    useOnboardingStore.getState().setField("height", "180");
    useOnboardingStore.getState().setField("gender", "Man");

    const success = await useOnboardingStore.getState().saveProfileStep();

    assert.equal(success, true);
    assert.deepEqual(sentData, {
      dob: "1990-01-01",
      height: 180,
      gender: "Man",
    });
    assert.equal(useOnboardingStore.getState().step, 1);
    assert.equal(useOnboardingStore.getState().isSaving, false);
  } finally {
    onboardingApi.updateProfile = originalUpdate;
  }
});

test("onboarding saveGoalStep invokes backend and advances step", async () => {
  const originalUpdate = onboardingApi.updateGoals;
  let sentGoal: unknown = null;

  onboardingApi.updateGoals = async (payload) => {
    sentGoal = payload.goal;
    return { message: "Goal step saved successfully", step: 1, next_step: 2 };
  };

  try {
    useOnboardingStore.getState().setField("goal", "energy");
    const success = await useOnboardingStore.getState().saveGoalStep();

    assert.equal(success, true);
    assert.equal(sentGoal, "energy");
    assert.equal(useOnboardingStore.getState().step, 2);
  } finally {
    onboardingApi.updateGoals = originalUpdate;
  }
});

test("onboarding savePreferencesStep invokes backend and advances to review", async () => {
  const originalUpdate = onboardingApi.updatePreferences;
  let sentPayload: unknown = null;

  onboardingApi.updatePreferences = async (payload) => {
    sentPayload = payload;
    return { message: "Preferences step saved successfully", step: 2, next_step: 3 };
  };

  try {
    useOnboardingStore.getState().setField("diet", "Other");
    useOnboardingStore.getState().setField("otherDiet", "Gluten-free plant based");
    useOnboardingStore.getState().setField("allergies", ["Peanuts", "Other"]);
    useOnboardingStore.getState().setField("otherAllergy", "Strawberries");

    const success = await useOnboardingStore.getState().savePreferencesStep();

    assert.equal(success, true);
    assert.deepEqual(sentPayload, {
      diet: "Other",
      other_diet: "Gluten-free plant based",
      otherDiet: "Gluten-free plant based",
      allergies: ["Peanuts", "Other"],
      other_allergy: "Strawberries",
      otherAllergy: "Strawberries",
    });
    assert.equal(useOnboardingStore.getState().step, 3);
  } finally {
    onboardingApi.updatePreferences = originalUpdate;
  }
});

test("onboarding completeOnboarding marks completed and updates auth user", async () => {
  const originalComplete = onboardingApi.complete;

  onboardingApi.complete = async () => ({
    message: "Onboarding completed successfully",
    is_completed: true,
    redirect_to: "/dashboard",
  });

  useAuthStore.setState({
    user: { id: "user-1", email: "test@example.com", username: "tester", is_onboarded: false },
    isAuthenticated: true,
  });

  try {
    const redirectUrl = await useOnboardingStore.getState().completeOnboarding();

    assert.equal(redirectUrl, "/dashboard");
    assert.equal(useOnboardingStore.getState().isCompleted, true);
    assert.equal(useAuthStore.getState().user?.is_onboarded, true);
  } finally {
    onboardingApi.complete = originalComplete;
  }
});

test("onboarding fetchStatus hydrates existing backend data", async () => {
  const originalGetStatus = onboardingApi.getStatus;

  onboardingApi.getStatus = async () => ({
    onboarding_step: 2,
    is_completed: false,
    profile: {
      dob: "1994-08-20",
      height: 168.5,
      gender: "Woman",
    },
    goal: {
      goal: "balance",
    },
    preferences: {
      diet: "Vegetarian",
      other_diet: null,
      allergies: ["Milk", "Wheat"],
      other_allergy: null,
    },
  });

  try {
    await useOnboardingStore.getState().fetchStatus();

    const state = useOnboardingStore.getState();
    assert.equal(state.step, 2);
    assert.equal(state.isCompleted, false);
    assert.equal(state.profile.dob, "1994-08-20");
    assert.equal(state.profile.height, "168.5");
    assert.equal(state.profile.gender, "Woman");
    assert.equal(state.profile.goal, "balance");
    assert.equal(state.profile.diet, "Vegetarian");
    assert.deepEqual(state.profile.allergies, ["Milk", "Wheat"]);
  } finally {
    onboardingApi.getStatus = originalGetStatus;
  }
});

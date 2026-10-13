import test from "node:test";
import assert from "node:assert/strict";
import { useAuthStore } from "../lib/stores/auth-store";
import { authApi } from "../lib/api/auth";

test.beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
  });
});

test("auth store initial state is unauthenticated", () => {
  const state = useAuthStore.getState();
  assert.equal(state.user, null);
  assert.equal(state.isAuthenticated, false);
  assert.equal(state.isLoading, false);
  assert.equal(state.error, null);
});

test("auth store setUser updates user and isAuthenticated", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "tester",
    is_onboarded: false,
  };

  useAuthStore.getState().setUser(mockUser);
  const state = useAuthStore.getState();
  assert.deepEqual(state.user, mockUser);
  assert.equal(state.isAuthenticated, true);

  useAuthStore.getState().setUser(null);
  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().isAuthenticated, false);
});

test("auth store clearError resets error state", () => {
  useAuthStore.setState({ error: "Some error message" });
  assert.equal(useAuthStore.getState().error, "Some error message");

  useAuthStore.getState().clearError();
  assert.equal(useAuthStore.getState().error, null);
});

test("auth store signIn successfully signs in and hydrates user", async () => {
  const originalSignin = authApi.signin;
  const originalGetMe = authApi.getMe;

  const mockUser = {
    id: "user-456",
    email: "jamie@example.com",
    username: "jamie",
    is_onboarded: true,
  };

  authApi.signin = async () => ({
    message: "Signin successful",
    user: { id: "user-456", email: "jamie@example.com" },
  });

  authApi.getMe = async () => ({
    user: mockUser,
  });

  try {
    const user = await useAuthStore.getState().signIn({
      email: "jamie@example.com",
      password: "password123",
    });

    assert.deepEqual(user, mockUser);
    const state = useAuthStore.getState();
    assert.deepEqual(state.user, mockUser);
    assert.equal(state.isAuthenticated, true);
    assert.equal(state.isLoading, false);
    assert.equal(state.error, null);
  } finally {
    authApi.signin = originalSignin;
    authApi.getMe = originalGetMe;
  }
});

test("auth store signUp successfully registers and hydrates user", async () => {
  const originalSignup = authApi.signup;
  const originalGetMe = authApi.getMe;

  const mockUser = {
    id: "user-789",
    email: "new@example.com",
    username: "newuser",
    is_onboarded: false,
  };

  authApi.signup = async () => ({
    message: "User registered successfully",
    user: { username: "newuser", email: "new@example.com" },
  });

  authApi.getMe = async () => ({
    user: mockUser,
  });

  try {
    const user = await useAuthStore.getState().signUp({
      username: "newuser",
      email: "new@example.com",
      password: "password123",
    });

    assert.deepEqual(user, mockUser);
    const state = useAuthStore.getState();
    assert.deepEqual(state.user, mockUser);
    assert.equal(state.isAuthenticated, true);
    assert.equal(state.isLoading, false);
  } finally {
    authApi.signup = originalSignup;
    authApi.getMe = originalGetMe;
  }
});

test("auth store checkAuth handles unauthenticated sessions smoothly", async () => {
  const originalGetMe = authApi.getMe;

  authApi.getMe = async () => {
    const error = new Error("Not Authenticated");
    throw error;
  };

  try {
    const user = await useAuthStore.getState().checkAuth();
    assert.equal(user, null);
    const state = useAuthStore.getState();
    assert.equal(state.user, null);
    assert.equal(state.isAuthenticated, false);
    assert.equal(state.isInitialized, true);
    assert.equal(state.error, null);
  } finally {
    authApi.getMe = originalGetMe;
  }
});

test("auth store signOut resets authentication state", async () => {
  const originalLogout = authApi.logout;

  authApi.logout = async () => ({
    message: "Logged out successfully!",
  });

  useAuthStore.setState({
    user: { id: "1", email: "test@example.com", username: "user", is_onboarded: true },
    isAuthenticated: true,
  });

  try {
    await useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    assert.equal(state.user, null);
    assert.equal(state.isAuthenticated, false);
    assert.equal(state.isLoading, false);
  } finally {
    authApi.logout = originalLogout;
  }
});

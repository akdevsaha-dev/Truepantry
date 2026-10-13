import { create } from "zustand";
import { authApi } from "../api/auth";
import { formatApiError } from "../api/client";
import type { SigninPayload, SignupPayload, User } from "../api/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  checkAuth: () => Promise<User | null>;
  signIn: (data: SigninPayload) => Promise<User>;
  signUp: (data: SignupPayload) => Promise<User>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      const user = response.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      return user;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      return null;
    }
  },

  signIn: async (data: SigninPayload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.signin(data);
      // Fetch full authenticated user record
      const meResponse = await authApi.getMe();
      const user = meResponse.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err) {
      const errorMessage = formatApiError(err, "Failed to sign in. Please verify your credentials.");
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  signUp: async (data: SignupPayload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.signup(data);
      // Fetch full authenticated user record
      const meResponse = await authApi.getMe();
      const user = meResponse.user;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err) {
      const errorMessage = formatApiError(err, "Failed to create account. Please try again.");
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch {
      // Continue clearing client state even if network call had an issue
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

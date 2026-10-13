import axios, { type AxiosError } from "axios";
import type { ApiErrorResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

export function formatApiError(error: unknown, fallbackMessage = "An unexpected error occurred."): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const responseData = axiosError.response?.data;

    if (responseData?.detail) {
      if (typeof responseData.detail === "string") {
        return responseData.detail;
      }
      if (Array.isArray(responseData.detail)) {
        return responseData.detail
          .map((item) => {
            const field = item.loc && item.loc.length > 1 ? `${String(item.loc[item.loc.length - 1])}: ` : "";
            return `${field}${item.msg}`;
          })
          .join("; ");
      }
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (axiosError.response?.status === 401) {
      return "Authentication required or invalid credentials.";
    }

    if (axiosError.response?.status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (axiosError.response?.status === 404) {
      return "The requested resource was not found.";
    }

    if (axiosError.response?.status === 409) {
      return "A conflict occurred. An account with these details may already exist.";
    }

    if (axiosError.response?.status === 422) {
      return "Validation error. Please verify the submitted information.";
    }

    if (axiosError.response && axiosError.response.status >= 500) {
      return "Server error. Please try again later.";
    }

    if (axiosError.code === "ECONNABORTED") {
      return "The request timed out. Please check your connection and try again.";
    }

    if (axiosError.code === "ERR_NETWORK") {
      return "Unable to connect to the server. Please check your network connection.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

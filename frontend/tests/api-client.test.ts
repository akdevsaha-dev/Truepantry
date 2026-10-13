import test from "node:test";
import assert from "node:assert/strict";
import axios, { AxiosHeaders } from "axios";
import { apiClient, formatApiError } from "../lib/api/client";

test("apiClient has correct defaults", () => {
  assert.equal(apiClient.defaults.withCredentials, true);
  assert.equal(apiClient.defaults.headers["Content-Type"], "application/json");
  assert.equal(apiClient.defaults.timeout, 15000);
});

test("formatApiError formats string detail correctly", () => {
  const axiosError = new axios.AxiosError(
    "Request failed with status code 409",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { detail: "Email already registered" },
    }
  );

  const message = formatApiError(axiosError);
  assert.equal(message, "Email already registered");
});

test("formatApiError formats FastAPI validation array correctly", () => {
  const axiosError = new axios.AxiosError(
    "Unprocessable Entity",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 422,
      statusText: "Unprocessable Entity",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: {
        detail: [
          { loc: ["body", "dob"], msg: "Date of birth cannot be in the future", type: "value_error" },
          { loc: ["body", "height"], msg: "Input should be greater than or equal to 50", type: "greater_than_equal" },
        ],
      },
    }
  );

  const message = formatApiError(axiosError);
  assert.equal(
    message,
    "dob: Date of birth cannot be in the future; height: Input should be greater than or equal to 50"
  );
});

test("formatApiError returns clear message for 401 Unauthorized", () => {
  const axiosError = new axios.AxiosError(
    "Unauthorized",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: {},
    }
  );

  const message = formatApiError(axiosError);
  assert.equal(message, "Authentication required or invalid credentials.");
});

test("formatApiError returns clear message for network disconnection", () => {
  const axiosError = new axios.AxiosError("Network Error", "ERR_NETWORK");
  const message = formatApiError(axiosError);
  assert.equal(message, "Unable to connect to the server. Please check your network connection.");
});

test("formatApiError falls back gracefully for standard Errors", () => {
  const stdError = new Error("Custom client error");
  assert.equal(formatApiError(stdError), "Custom client error");

  assert.equal(formatApiError(null, "Default fallback"), "Default fallback");
});

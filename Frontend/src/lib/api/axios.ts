import axios, { AxiosError } from "axios";
import { getToken, clearAuth } from "../auth-storage";
import { ApiError } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("Runtime configuration error: NEXT_PUBLIC_API_URL is missing. Please define it in your environment variables.");
}

export const apiInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    let message: string | string[] = "An unexpected error occurred.";
    let errorName = "Error";
    const statusCode = error.response?.status;

    if (error.response) {
      const data = error.response.data as any;
      if (data && typeof data === "object") {
        if (typeof data.message === "string" || Array.isArray(data.message)) {
          message = data.message;
        }
        if (typeof data.error === "string") {
          errorName = data.error;
        }
      }

      if (statusCode === 401) {
        clearAuth();
        const apiError: ApiError = {
          message: message || "Unauthorized access.",
          error: errorName || "Unauthorized",
          statusCode: 401,
        };
        return Promise.reject(apiError);
      }

      if (statusCode === 403) {
        const apiError: ApiError = {
          message: message || "Forbidden access.",
          error: errorName || "Forbidden",
          statusCode: 403,
        };
        return Promise.reject(apiError);
      }

      if (statusCode === 500) {
        const apiError: ApiError = {
          message: message || "Internal server error.",
          error: errorName || "Internal Server Error",
          statusCode: 500,
        };
        return Promise.reject(apiError);
      }
    } else if (error.request) {
      message = "Network error. Please check your internet connection.";
      errorName = "Network Error";
    }

    const apiError: ApiError = {
      message,
      error: errorName,
      statusCode,
    };
    return Promise.reject(apiError);
  }
);

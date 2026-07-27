import axios from "axios";
import { useToast } from "@/composables/useToast";

const toast = useToast();
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cookie-based token management
const TOKEN_KEY = "admin_token";

export function getAuthToken(): string | null {
  const match = document.cookie.match(
    new RegExp("(^| )" + TOKEN_KEY + "=([^;]+)"),
  );
  return match ? decodeURIComponent(match[2]) : null;
}

export function setAuthToken(token: string, maxAgeSeconds = 3600): void {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Strict`;
}

export function clearAuthToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      toast.error("Koneksi terputus. Tidak dapat terhubung ke server.");
    }
    // Return the full error object rather than stripping it to a simple Error(message)
    // so that we can type it as AxiosError<ApiError> and access specific fields like `errors`
    return Promise.reject(error);
  },
);

export default api;

import api from "@/lib/api";
import { setAuthToken, clearAuthToken } from "@/lib/api";
import type { ApiResponse } from "@/types/api-response";

interface LoginResponse {
  token: string;
  expiresAt: string;
}

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      username,
      password,
    });
    const data = res.data.data;
    if (data.token) {
      // Calculate max-age from expiresAt
      const expiresAt = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const maxAgeSeconds = Math.max(Math.floor((expiresAt - now) / 1000), 60);
      setAuthToken(data.token, maxAgeSeconds);
    }
    return data;
  }

  async register(username: string, password: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>("/auth/register", {
      username,
      password,
    });
    // Clear token after register (one-time use per login)
    clearAuthToken();
    return res.data;
  }
}

export const authService = new AuthService();

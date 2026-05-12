import { Platform } from "react-native";
import { API_BASE_URL } from "../constants/api";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Web fallback: expo-secure-store is not available on web
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export async function getAccessToken(): Promise<string | null> {
  return storage.getItem(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return storage.getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await storage.setItem(TOKEN_KEY, accessToken);
  await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await storage.deleteItem(TOKEN_KEY);
  await storage.deleteItem(REFRESH_TOKEN_KEY);
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  discordInviteUrl?: string;
}

type AuthFailureListener = () => void;
const authFailureListeners = new Set<AuthFailureListener>();

export function onAuthFailure(listener: AuthFailureListener): () => void {
  authFailureListeners.add(listener);
  return () => {
    authFailureListeners.delete(listener);
  };
}

async function notifyAuthFailure(): Promise<void> {
  await clearTokens();
  authFailureListeners.forEach((l) => {
    try {
      l();
    } catch {}
  });
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await notifyAuthFailure();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json: ApiResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }> = await res.json();

    if (json.success && json.data) {
      await setTokens(json.data.accessToken, json.data.refreshToken);
      return json.data.accessToken;
    }
  } catch {}
  await notifyAuthFailure();
  return null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  let json: ApiResponse<T> = await res.json();

  if (
    !json.success &&
    json.error?.code === "UNAUTHORIZED" &&
    token
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
      json = await res.json();
    }
  }

  return json;
}

export function get<T>(path: string) {
  return apiRequest<T>(path, { method: "GET" });
}

export function post<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function put<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function patch<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function del<T>(path: string) {
  return apiRequest<T>(path, { method: "DELETE" });
}

import { get, post, clearTokens } from "./api-client";
import { API_BASE_URL } from "../constants/api";

export interface UserInfo {
  userId: string;
  guildId: string;
  nickname: string;
  studentNo: string;
  profileImage: string;
  dormitory: string;
  level: number;
  levelName: string;
  timezone: string;
}

interface VerifyMemberData {
  isMember: boolean;
  user: UserInfo;
}

// Backend's /api/auth/discord 302-redirects to Discord's OAuth page.
// On success, Discord → backend callback → 302 to masahak://login?accessToken=...
// The mobile app captures the deep link via WebBrowser.openAuthSessionAsync
// and onboarding.tsx parses tokens directly from the URL — no extra API call.
export function getDiscordAuthUrl(): string {
  return `${API_BASE_URL}/api/auth/discord`;
}

export async function verifyMember() {
  return get<VerifyMemberData>("/api/auth/verify-member");
}

export async function logout() {
  try {
    return await post<{ message: string }>("/api/auth/logout");
  } finally {
    await clearTokens();
  }
}

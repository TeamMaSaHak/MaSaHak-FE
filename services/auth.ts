import { get, post, setTokens, clearTokens } from "./api-client";

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

interface LoginCallbackData {
  tokens: { accessToken: string; refreshToken: string; expiresIn: number };
  user: UserInfo;
  isMember: boolean;
}

interface VerifyMemberData {
  isMember: boolean;
  user: UserInfo;
}

export async function getDiscordLoginUrl() {
  return get<{ redirectUrl: string }>("/api/auth/discord");
}

export async function loginWithDiscordCallback(
  code: string,
  timezone?: string
) {
  const tz = timezone || "Asia/Seoul";
  const res = await get<LoginCallbackData>(
    `/api/auth/discord/callback?code=${code}&timezone=${tz}`
  );
  if (res.success && res.data) {
    await setTokens(
      res.data.tokens.accessToken,
      res.data.tokens.refreshToken
    );
  }
  return res;
}

export async function verifyMember() {
  return get<VerifyMemberData>("/api/auth/verify-member");
}

export async function logout() {
  const res = await post<{ message: string }>("/api/auth/logout");
  await clearTokens();
  return res;
}

import { post } from "./api-client";

export function registerFcmToken(fcmToken: string, platform: "android" | "ios") {
  return post<{ deviceId: number; isNew: boolean }>("/api/devices/token", {
    fcmToken,
    platform,
  });
}

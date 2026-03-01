import { get, put, patch } from "./api-client";

interface NotificationSettings {
  pushEnabled: boolean;
  updatedAt: string;
}

interface TimezoneSettings {
  timezone: string;
  updatedAt: string;
}

export function getNotificationSettings() {
  return get<NotificationSettings>("/api/settings/notifications");
}

export function updateNotificationSettings(pushEnabled: boolean) {
  return put<NotificationSettings>("/api/settings/notifications", {
    pushEnabled,
  });
}

export function getTimezone() {
  return get<TimezoneSettings>("/api/settings/timezone");
}

export function updateTimezone(timezone: string) {
  return patch<TimezoneSettings>("/api/settings/timezone", { timezone });
}

import { get, patch } from "./api-client";

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListData {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export function getNotifications(page = 1, limit = 20) {
  return get<NotificationListData>(
    `/api/notifications?page=${page}&limit=${limit}`
  );
}

export function getUnreadCount() {
  return get<{ count: number }>("/api/notifications/unread-count");
}

export function markAsRead(notificationId: number) {
  return patch<{ id: number; isRead: boolean; readAt: string }>(
    `/api/notifications/${notificationId}/read`
  );
}

export function markAllAsRead() {
  return patch<{ updatedCount: number }>("/api/notifications/read-all");
}

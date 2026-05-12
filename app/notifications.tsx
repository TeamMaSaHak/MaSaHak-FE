import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notifications";

interface Notification {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
}

function Notifications() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const hasUnread = notifications.some((n) => !n.isRead);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        if (res.success && res.data) {
          const mapped: Notification[] = res.data.notifications.map((n) => ({
            id: String(n.id),
            title: n.title,
            description: n.body,
            isRead: n.isRead,
          }));
          setNotifications(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const handleNotificationPress = async (notificationId: string) => {
    try {
      const res = await markAsRead(Number(notificationId));
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>알림이 없습니다</Text>
    </View>
  );

  const renderNotificationList = () => (
    <ScrollView
      style={styles.listContainer}
      showsVerticalScrollIndicator={false}
    >
      {notifications.map((notification) => (
        <Pressable
          key={notification.id}
          style={styles.notificationItem}
          onPress={() => handleNotificationPress(notification.id)}
        >
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>
                {notification.title}
              </Text>
              {!notification.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notificationDescription}>
              {notification.description}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Topbar
        title="알림"
        left={
          <MaterialIcons
            name="arrow-back-ios-new"
            size={22}
            color={colors.black}
          />
        }
        onLeftPress={() => navigation.goBack()}
        right={
          hasUnread ? (
            <Text style={{ fontFamily: "Pretendard-Regular", fontSize: 12, color: colors.black }}>
              전체 읽음
            </Text>
          ) : undefined
        }
        onRightPress={hasUnread ? handleMarkAllAsRead : undefined}
      />

      <View style={[styles.content, { paddingTop: insets.top + 50 }]}>
        {notifications.length === 0
          ? renderEmptyState()
          : renderNotificationList()}
      </View>
    </View>
  );
}

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  notificationItem: {
    minHeight: 68,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    alignSelf: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  notificationTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 12,
    lineHeight: 16,
    color: colors.black,
    flex: 1,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.black,
    marginLeft: 8,
  },
  notificationDescription: {
    fontFamily: "Pretendard-Regular",
    fontSize: 10,
    lineHeight: 14,
    color: colors.gray300,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray300,
  },
});

import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";

interface Notification {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
}

function Notifications() {
  const navigation = useNavigation();

  // Mock notification data
  const notifications: Notification[] = [
    {
      id: "1",
      title: "새로운 공지사항",
      description: "2학기 기숙사 배정 결과가 발표되었습니다.",
      isRead: false,
    },
    {
      id: "2",
      title: "일정 알림",
      description: "내일 오전 9시 마법 실습 수업이 있습니다.",
      isRead: false,
    },
    {
      id: "3",
      title: "과제 알림",
      description: "마법 역사 레포트 제출 마감이 3일 남았습니다.",
      isRead: true,
    },
    {
      id: "4",
      title: "시스템 알림",
      description: "앱이 최신 버전으로 업데이트되었습니다.",
      isRead: true,
    },
  ];

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
        <Pressable key={notification.id} style={styles.notificationItem}>
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
      />

      <View style={styles.content}>
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
    paddingTop: 50,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  notificationItem: {
    width: 342,
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

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import { useAuth } from "../context/auth-context";
import { getProfile, MemberProfile } from "../services/members";
import { getUnreadCount } from "../services/notifications";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../services/settings";

function Profile() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);

  useEffect(() => {
    fetchProfile();
    (async () => {
      try {
        const res = await getUnreadCount();
        if (res.success && res.data) {
          setUnreadCount(res.data.count);
        }
      } catch {}
    })();
    (async () => {
      try {
        const res = await getNotificationSettings();
        if (res.success && res.data) {
          setPushEnabled(res.data.pushEnabled);
        }
      } catch {}
    })();
  }, []);

  const handleTogglePush = async () => {
    if (isTogglingPush) return;
    const next = !pushEnabled;
    setIsTogglingPush(true);
    setPushEnabled(next); // optimistic
    try {
      const res = await updateNotificationSettings(next);
      if (!res.success) {
        setPushEnabled(!next); // rollback
      }
    } catch {
      setPushEnabled(!next);
    } finally {
      setIsTogglingPush(false);
    }
  };

  const TEST_MESSAGES = [
    "오늘 투두 아직 안 끝났어요 📝",
    "뽀모도로 한 사이클 어때요?",
    "잠깐, 일기 쓰셨나요?",
    "공부 1시간 달성! 🎉",
    "견습마법사님, 집중 시간이에요 🪄",
    "친구가 같이 공부하고 있어요",
    "타이머가 기다리고 있어요 ⏱️",
    "오늘의 목표에 한 발짝 더!",
    "쉬는 시간 끝! 다시 집중 😤",
    "새로운 답장이 도착했어요 💌",
  ];

  const handleSendTestNotification = async () => {
    if (Platform.OS === "web") {
      Alert.alert("안내", "웹에서는 테스트 알림이 동작하지 않아요.");
      return;
    }
    try {
      const Notifications = await import("expo-notifications");

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert("권한 필요", "알림 권한을 허용해주세요.");
        return;
      }

      const msg = TEST_MESSAGES[Math.floor(Math.random() * TEST_MESSAGES.length)];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "마사학",
          body: msg,
        },
        trigger: null,
      });
    } catch (e) {
      Alert.alert("오류", "알림 전송에 실패했습니다.");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error("프로필 조회 실패:", error);
    }
  };

  const displayName = profile?.nickname || user?.nickname || "";
  const displayStudentNo = profile?.studentNo || user?.studentNo || "";
  const displayGrade = profile?.gradeName
    ? profile.gradeName
    : profile?.grade
    ? `${profile.grade}학년`
    : "";
  const displayDormitory = profile?.dormitory || user?.dormitory || "";
  const displayProfileImage =
    profile?.profileImage || user?.profileImage || null;

  // 로그아웃
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Onboarding" }],
      });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Settings grid items
  const settingsItems = [
    {
      icon: "app-registration" as const,
      label: "허용 어플",
      onPress: () => navigation.navigate("AllowedApps"),
    },
    {
      icon: (pushEnabled ? "notifications-active" : "notifications-off") as
        | "notifications-active"
        | "notifications-off",
      label: pushEnabled ? "알림 ON" : "알림 OFF",
      onPress: handleTogglePush,
    },
    {
      icon: "assignment" as const,
      label: "이용약관",
      onPress: () => navigation.navigate("Terms"),
    },
    {
      icon: "image" as const,
      label: "개인정보 처리방침",
      onPress: () => navigation.navigate("Privacy"),
    },
  ];

  return (
    <View style={styles.container}>
      <Topbar
        title="마이 페이지"
        right={<MaterialIcons name="mail" size={22} color={colors.black} />}
        onRightPress={() => navigation.navigate("Notifications")}
        rightBadge={unreadCount}
      />

      <ScrollView
        style={[styles.content, { paddingTop: insets.top + 50 }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Card */}
        <View style={styles.studentCard}>
          <Text style={styles.cardTitle}>마법사관학교 학생증</Text>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {displayProfileImage ? (
              <Image
                source={{ uri: displayProfileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons
                  name="account-circle"
                  size={110}
                  color={colors.gray200}
                />
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.profileName}>{displayName}</Text>

          {/* Info Lines */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>학번</Text>
              <View style={styles.infoDivider} />
              <Text style={styles.infoValue}>{displayStudentNo}</Text>
            </View>

            <View style={styles.infoSeparator} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>학년</Text>
              <View style={styles.infoDivider} />
              <Text style={styles.infoValue}>{displayGrade}</Text>
            </View>

            <View style={styles.infoSeparator} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>기숙사</Text>
              <View style={styles.infoDivider} />
              <Text style={styles.infoValue}>{displayDormitory}</Text>
            </View>
          </View>
        </View>

        {/* Settings Grid */}
        <View style={styles.settingsGrid}>
          {settingsItems.map((item, index) => (
            <Pressable
              key={index}
              style={styles.settingsItem}
              onPress={item.onPress}
            >
              {item.icon === "image" ? (
                <View style={styles.settingsIconPlaceholder}>
                  <MaterialIcons
                    name="image"
                    size={32}
                    color={colors.gray300}
                  />
                </View>
              ) : (
                <MaterialIcons
                  name={item.icon}
                  size={38}
                  color={colors.black}
                />
              )}
              <Text style={styles.settingsLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Action Button */}
        <Pressable
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.logoutButtonText}>
              {user ? "로그아웃" : "입학하기"}
            </Text>
          )}
        </Pressable>

        {/* Test notification (dev helper) */}
        <Pressable
          style={styles.testNotifButton}
          onPress={handleSendTestNotification}
        >
          <Text style={styles.testNotifButtonText}>🔔 테스트 알림 보내기</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },

  // Student Card
  studentCard: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  cardTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 14,
    lineHeight: 20,
    color: colors.black,
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profileImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray100,
  },
  profileName: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    lineHeight: 24,
    color: colors.black,
    marginBottom: 20,
  },

  // Info Lines
  infoContainer: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  infoLabel: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: colors.black,
    width: 40,
  },
  infoDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.gray200,
    marginHorizontal: 12,
  },
  infoValue: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: colors.black,
    flex: 1,
  },
  infoSeparator: {
    height: 1,
    backgroundColor: colors.gray100,
    marginHorizontal: 8,
  },

  // Settings Grid
  settingsGrid: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginTop: 16,
    gap: 8,
    justifyContent: "center",
  },
  settingsItem: {
    flex: 1,
    height: 80,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  settingsIconPlaceholder: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsLabel: {
    fontFamily: "Pretendard-Regular",
    fontSize: 10,
    lineHeight: 14,
    color: colors.black,
    textAlign: "center",
  },

  // Logout
  logoutButton: {
    width: 240,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
  },
  testNotifButton: {
    width: 240,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  testNotifButtonText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray300,
  },
});

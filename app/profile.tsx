import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import { useAuth } from "../context/auth-context";
import { getProfile, MemberProfile } from "../services/members";

function Profile() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

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
      icon: "notifications-active" as const,
      label: "알림",
      onPress: () => navigation.navigate("Notifications"),
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
      />

      <ScrollView
        style={styles.content}
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

        {/* Logout Button */}
        <Pressable
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          )}
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
    paddingTop: 50,
  },
  contentContainer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 120,
  },

  // Student Card
  studentCard: {
    width: 300,
    height: 402,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: "center",
    paddingTop: 24,
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
    flexWrap: "wrap",
    width: 300,
    marginTop: 16,
    gap: 12,
    justifyContent: "center",
  },
  settingsItem: {
    width: 144,
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
});

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { Blank, Mail } from "../assets/icons";
import { colors } from "../constants/colors";

interface App {
  id: string;
  name: string;
  icon: string;
  isAllowed: boolean;
}

function Profile() {
  const navigation = useNavigation<any>();
  const [showAppModal, setShowAppModal] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"allowed" | "blocked">("allowed");

  // Mock user data
  const userProfile = {
    name: "김철수",
    studentId: "20240101",
    grade: "3학년",
    dormitory: "창의관",
    profileImage: null, // URL or null for placeholder
  };

  // Mock app data
  const [apps, setApps] = useState<App[]>([
    { id: "1", name: "YouTube", icon: "logo-youtube", isAllowed: true },
    { id: "2", name: "Instagram", icon: "logo-instagram", isAllowed: true },
    { id: "3", name: "Facebook", icon: "logo-facebook", isAllowed: false },
    { id: "4", name: "Twitter", icon: "logo-twitter", isAllowed: false },
    { id: "5", name: "TikTok", icon: "play-circle", isAllowed: true },
    { id: "6", name: "Netflix", icon: "play", isAllowed: false },
    { id: "7", name: "게임", icon: "game-controller", isAllowed: false },
    { id: "8", name: "카카오톡", icon: "chatbubble", isAllowed: true },
  ]);

  // 앱 검색 필터링
  const getFilteredApps = () => {
    return apps.filter((app) => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "allowed" ? app.isAllowed : !app.isAllowed;
      return matchesSearch && matchesCategory;
    });
  };

  // 앱 허용/차단 토글
  const toggleAppPermission = (appId: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, isAllowed: !app.isAllowed } : app
      )
    );
  };

  // 로그아웃
  const handleLogout = () => {
    // 실제 앱에서는 로그아웃 로직 구현
    console.log("로그아웃");
  };

  return (
    <View style={styles.container}>
      <Topbar
        title="프로필"
        left={<Blank size={22} />}
        right={<Mail size={22} />}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 섹션 */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {userProfile.profileImage ? (
              <Image
                source={{ uri: userProfile.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={48} color={colors.black} />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <View style={styles.profileDetails}>
              <Text style={styles.profileDetailText}>
                {userProfile.studentId} · {userProfile.grade} · {userProfile.dormitory}
              </Text>
            </View>
          </View>
        </View>

        {/* 설정 버튼들 */}
        <View style={styles.settingsSection}>
          {/* 허용 어플 */}
          <Pressable
            style={styles.settingItem}
            onPress={() => setShowAppModal(true)}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="apps" size={24} color={colors.black} />
              <Text style={styles.settingItemText}>허용 어플</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>

          {/* 알림 */}
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="notifications" size={24} color={colors.black} />
              <Text style={styles.settingItemText}>알림</Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: "#E0E0E0", true: colors.black }}
              thumbColor={colors.white}
            />
          </View>

          {/* 이용약관 */}
          <Pressable
            style={styles.settingItem}
            onPress={() => navigation.navigate("Terms")}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="document-text" size={24} color={colors.black} />
              <Text style={styles.settingItemText}>이용약관</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>

          {/* 개인정보 처리방침 */}
          <Pressable
            style={styles.settingItem}
            onPress={() => navigation.navigate("Privacy")}
          >
            <View style={styles.settingItemLeft}>
              <Ionicons name="shield-checkmark" size={24} color={colors.black} />
              <Text style={styles.settingItemText}>개인정보 처리방침</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
        </View>

        {/* 로그아웃 버튼 */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </Pressable>
      </ScrollView>

      {/* 허용 어플 관리 모달 */}
      <Modal
        visible={showAppModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAppModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.appModalContent}>
            {/* 모달 헤더 */}
            <View style={styles.appModalHeader}>
              <Text style={styles.appModalTitle}>허용 어플 관리</Text>
              <Pressable onPress={() => setShowAppModal(false)}>
                <Ionicons name="close" size={28} color={colors.black} />
              </Pressable>
            </View>

            {/* 검색창 */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#999"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="어플 검색"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* 카테고리 탭 */}
            <View style={styles.categoryTabs}>
              <Pressable
                style={[
                  styles.categoryTab,
                  selectedCategory === "allowed" && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory("allowed")}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === "allowed" && styles.categoryTabTextActive,
                  ]}
                >
                  허용
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.categoryTab,
                  selectedCategory === "blocked" && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory("blocked")}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === "blocked" && styles.categoryTabTextActive,
                  ]}
                >
                  비허용
                </Text>
              </Pressable>
            </View>

            {/* 어플 리스트 */}
            <ScrollView style={styles.appList} showsVerticalScrollIndicator={false}>
              {getFilteredApps().map((app) => (
                <View key={app.id} style={styles.appItem}>
                  <View style={styles.appItemLeft}>
                    <Ionicons
                      name={app.icon as any}
                      size={32}
                      color={colors.black}
                    />
                    <Text style={styles.appItemName}>{app.name}</Text>
                  </View>
                  <Pressable
                    style={[
                      styles.appToggleButton,
                      app.isAllowed && styles.appToggleButtonAllowed,
                    ]}
                    onPress={() => toggleAppPermission(app.id)}
                  >
                    <Text
                      style={[
                        styles.appToggleButtonText,
                        app.isAllowed && styles.appToggleButtonTextAllowed,
                      ]}
                    >
                      {app.isAllowed ? "허용됨" : "차단됨"}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingTop: 74,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 8,
  },
  profileDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileDetailText: {
    fontSize: 14,
    color: "#666",
  },
  settingsSection: {
    paddingVertical: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingItemText: {
    fontSize: 16,
    color: colors.black,
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 120,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  appModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    height: "80%",
  },
  appModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  appModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoryTabs: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  categoryTabActive: {
    backgroundColor: colors.black,
  },
  categoryTabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
  categoryTabTextActive: {
    color: colors.white,
  },
  appList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  appItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  appItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appItemName: {
    fontSize: 16,
    color: colors.black,
  },
  appToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
  },
  appToggleButtonAllowed: {
    backgroundColor: "#4ECDC4",
  },
  appToggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  appToggleButtonTextAllowed: {
    color: colors.white,
  },
});

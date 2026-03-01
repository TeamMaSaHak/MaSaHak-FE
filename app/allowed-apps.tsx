import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";

interface App {
  id: string;
  name: string;
  isAllowed: boolean;
}

function AllowedApps() {
  const navigation = useNavigation();

  const [selectedTab, setSelectedTab] = useState<"allowed" | "blocked">(
    "allowed"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [apps, setApps] = useState<App[]>([
    { id: "1", name: "YouTube", isAllowed: true },
    { id: "2", name: "Instagram", isAllowed: true },
    { id: "3", name: "카카오톡", isAllowed: true },
    { id: "4", name: "네이버", isAllowed: true },
    { id: "5", name: "Facebook", isAllowed: false },
    { id: "6", name: "Twitter", isAllowed: false },
    { id: "7", name: "TikTok", isAllowed: false },
    { id: "8", name: "Netflix", isAllowed: false },
  ]);

  const allowedApps = apps.filter((app) => app.isAllowed);
  const blockedApps = apps.filter((app) => !app.isAllowed);

  const getFilteredApps = () => {
    const baseList =
      selectedTab === "allowed" ? allowedApps : blockedApps;
    if (!searchQuery.trim()) return baseList;
    return baseList.filter((app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const toggleAppPermission = (appId: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, isAllowed: !app.isAllowed } : app
      )
    );
  };

  const filteredApps = getFilteredApps();

  return (
    <View style={styles.container}>
      <Topbar
        title="허용 어플 관리"
        left={
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={colors.black}
          />
        }
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Tab Row */}
        <View style={styles.tabRow}>
          <Pressable
            style={[
              styles.tab,
              selectedTab === "allowed" ? styles.tabActive : styles.tabInactive,
            ]}
            onPress={() => setSelectedTab("allowed")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "allowed"
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              허용
            </Text>
            <View
              style={[
                styles.tabCount,
                selectedTab === "allowed"
                  ? styles.tabCountActive
                  : styles.tabCountInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  selectedTab === "allowed"
                    ? styles.tabCountTextActive
                    : styles.tabCountTextInactive,
                ]}
              >
                {allowedApps.length}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[
              styles.tab,
              selectedTab === "blocked" ? styles.tabActive : styles.tabInactive,
            ]}
            onPress={() => setSelectedTab("blocked")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "blocked"
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              비허용
            </Text>
            <View
              style={[
                styles.tabCount,
                selectedTab === "blocked"
                  ? styles.tabCountActive
                  : styles.tabCountInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabCountText,
                  selectedTab === "blocked"
                    ? styles.tabCountTextActive
                    : styles.tabCountTextInactive,
                ]}
              >
                {blockedApps.length}
              </Text>
            </View>
          </Pressable>

          {/* Search Toggle */}
          <Pressable
            style={styles.searchToggle}
            onPress={() => {
              setIsSearchActive(!isSearchActive);
              if (isSearchActive) setSearchQuery("");
            }}
          >
            <MaterialIcons name="search" size={22} color={colors.black} />
          </Pressable>
        </View>

        {/* Search Bar */}
        {isSearchActive && (
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons
                name="search"
                size={18}
                color={colors.gray300}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="어플 검색"
                placeholderTextColor={colors.gray300}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={colors.gray300}
                  />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* App List */}
        <ScrollView
          style={styles.appList}
          showsVerticalScrollIndicator={false}
        >
          {filteredApps.map((app) => (
            <View key={app.id} style={styles.appItem}>
              {/* App Icon Placeholder */}
              <View style={styles.appIconPlaceholder}>
                <MaterialIcons
                  name="apps"
                  size={24}
                  color={colors.gray300}
                />
              </View>

              {/* App Name */}
              <Text style={styles.appName}>{app.name}</Text>

              {/* Toggle Button */}
              <Pressable
                style={[
                  styles.toggleButton,
                  app.isAllowed
                    ? styles.toggleButtonOn
                    : styles.toggleButtonOff,
                ]}
                onPress={() => toggleAppPermission(app.id)}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    app.isAllowed
                      ? styles.toggleCircleOn
                      : styles.toggleCircleOff,
                  ]}
                />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default AllowedApps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 27,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.black,
  },
  tabInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  tabText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 12,
    lineHeight: 16,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabTextInactive: {
    color: colors.black,
  },
  tabCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tabCountActive: {
    backgroundColor: colors.gray400,
  },
  tabCountInactive: {
    backgroundColor: colors.gray100,
  },
  tabCountText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 10,
    lineHeight: 14,
  },
  tabCountTextActive: {
    color: colors.white,
  },
  tabCountTextInactive: {
    color: colors.black,
  },
  searchToggle: {
    marginLeft: "auto",
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  // Search
  searchBarContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  searchBar: {
    width: 310,
    height: 38,
    backgroundColor: colors.gray100,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: colors.black,
    padding: 0,
  },

  // App List
  appList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  appIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appName: {
    flex: 1,
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.black,
  },

  // Toggle
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleButtonOn: {
    backgroundColor: colors.black,
  },
  toggleButtonOff: {
    backgroundColor: colors.gray200,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  toggleCircleOn: {
    alignSelf: "flex-end",
  },
  toggleCircleOff: {
    alignSelf: "flex-start",
  },
});

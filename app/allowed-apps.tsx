import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  AppState,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import {
  checkUsageStatsPermission,
  requestUsageStatsPermission,
  checkOverlayPermission,
  requestOverlayPermission,
} from "../modules/app-monitor";
import {
  AppWithStatus,
  loadAppsWithStatus,
  saveAllowedPackages,
  startAppMonitoring,
  stopAppMonitoring,
  syncMonitoringList,
  getMonitoringActive,
} from "../services/app-monitor";

type PermissionStep = "idle" | "usage" | "overlay" | "done";

function AllowedApps() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [apps, setApps] = useState<AppWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permStep, setPermStep] = useState<PermissionStep>("idle");
  const [isMonitoring, setIsMonitoring] = useState(false);

  const [selectedTab, setSelectedTab] = useState<"allowed" | "blocked">("blocked");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const appStateRef = useRef(AppState.currentState);

  // 권한 확인 후 단계 설정
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    const [hasUsage, hasOverlay] = await Promise.all([
      checkUsageStatsPermission(),
      checkOverlayPermission(),
    ]);
    if (!hasUsage) { setPermStep("usage"); return false; }
    if (!hasOverlay) { setPermStep("overlay"); return false; }
    setPermStep("done");
    return true;
  }, []);

  // 앱 목록 로드
  const loadApps = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await loadAppsWithStatus();
      setApps(loaded);
    } catch (e) {
      Alert.alert("오류", "앱 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await checkPermissions();
      if (ok) await loadApps();
      else setIsLoading(false);

      if (Platform.OS === "android") {
        try {
          const active = await getMonitoringActive();
          setIsMonitoring(active);
        } catch {}
      }
    })();
  }, []);

  // 앱이 설정에서 돌아왔을 때 권한 재확인 + 모니터링 상태 재동기화
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      if (appStateRef.current !== "active" && nextState === "active") {
        if (permStep === "usage" || permStep === "overlay") {
          const ok = await checkPermissions();
          if (ok && apps.length === 0) await loadApps();
        }

        if (Platform.OS === "android") {
          try {
            const active = await getMonitoringActive();
            setIsMonitoring(active);
          } catch {}
        }
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [permStep, apps.length]);

  const toggleApp = async (packageName: string) => {
    const next = apps.map((a) =>
      a.packageName === packageName ? { ...a, isAllowed: !a.isAllowed } : a
    );
    setApps(next);

    const allowed = next.filter((a) => a.isAllowed).map((a) => a.packageName);
    await saveAllowedPackages(allowed);

    if (isMonitoring) await syncMonitoringList(next);
  };

  const toggleMonitoring = async () => {
    if (isMonitoring) {
      await stopAppMonitoring();
      setIsMonitoring(false);
    } else {
      await startAppMonitoring(apps);
      setIsMonitoring(true);
    }
  };

  const allowedApps = apps.filter((a) => a.isAllowed);
  const blockedApps = apps.filter((a) => !a.isAllowed);

  const filteredApps = (() => {
    const base = selectedTab === "allowed" ? allowedApps : blockedApps;
    if (!searchQuery.trim()) return base;
    return base.filter((a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  })();

  // ── iOS 미지원 화면 ──────────────────────────────────────────
  if (Platform.OS !== "android") {
    return (
      <View style={styles.container}>
        <Topbar
          title="허용 어플 관리"
          left={<MaterialIcons name="arrow-back" size={22} color={colors.black} />}
          onLeftPress={() => navigation.goBack()}
        />
        <View style={[styles.permContainer, { paddingTop: insets.top + 64 }]}>
          <MaterialIcons name="phone-android" size={56} color={colors.black} />
          <Text style={styles.permTitle}>Android 전용 기능</Text>
          <Text style={styles.permDesc}>
            앱 차단 기능은 Android에서만 지원해요.{"\n"}
            iPhone에서는 이용하실 수 없어요.
          </Text>
          <Pressable style={styles.permButton} onPress={() => navigation.goBack()}>
            <Text style={styles.permButtonText}>돌아가기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── 권한 요청 화면 ──────────────────────────────────────────
  if (permStep === "usage") {
    return (
      <View style={styles.container}>
        <Topbar
          title="허용 어플 관리"
          left={<MaterialIcons name="arrow-back" size={22} color={colors.black} />}
          onLeftPress={() => navigation.goBack()}
        />
        <View style={[styles.permContainer, { paddingTop: insets.top + 64 }]}>
          <MaterialIcons name="bar-chart" size={56} color={colors.black} />
          <Text style={styles.permTitle}>앱 사용 현황 접근 권한</Text>
          <Text style={styles.permDesc}>
            비허용 앱이 열렸을 때 감지하려면{"\n"}
            <Text style={styles.permBold}>설정 → 앱 → 특별 앱 권한 → 사용 정보 접근</Text>
            {"\n"}에서 마법사관학교를 허용해주세요.
          </Text>
          <Pressable
            style={styles.permButton}
            onPress={requestUsageStatsPermission}
          >
            <Text style={styles.permButtonText}>설정 열기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (permStep === "overlay") {
    return (
      <View style={styles.container}>
        <Topbar
          title="허용 어플 관리"
          left={<MaterialIcons name="arrow-back" size={22} color={colors.black} />}
          onLeftPress={() => navigation.goBack()}
        />
        <View style={[styles.permContainer, { paddingTop: insets.top + 64 }]}>
          <MaterialIcons name="layers" size={56} color={colors.black} />
          <Text style={styles.permTitle}>다른 앱 위에 표시 권한</Text>
          <Text style={styles.permDesc}>
            비허용 앱 위에 차단 화면을 띄우려면{"\n"}
            <Text style={styles.permBold}>다른 앱 위에 표시</Text> 권한이 필요해요.
          </Text>
          <Pressable
            style={styles.permButton}
            onPress={requestOverlayPermission}
          >
            <Text style={styles.permButtonText}>권한 허용하기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── 로딩 화면 ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Topbar
          title="허용 어플 관리"
          left={<MaterialIcons name="arrow-back" size={22} color={colors.black} />}
          onLeftPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.black} />
          <Text style={styles.loadingText}>설치된 앱 불러오는 중…</Text>
        </View>
      </View>
    );
  }

  // ── 메인 화면 ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Topbar
        title="허용 어플 관리"
        left={<MaterialIcons name="arrow-back" size={22} color={colors.black} />}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={[styles.content, { paddingTop: insets.top + 50 }]}>
        {/* 모니터링 토글 배너 */}
        <Pressable
          style={[
            styles.monitorBanner,
            isMonitoring ? styles.monitorBannerOn : styles.monitorBannerOff,
          ]}
          onPress={toggleMonitoring}
        >
          <MaterialIcons
            name={isMonitoring ? "shield" : "gpp-bad"}
            size={18}
            color={isMonitoring ? colors.white : colors.black}
          />
          <Text
            style={[
              styles.monitorText,
              { color: isMonitoring ? colors.white : colors.black },
            ]}
          >
            {isMonitoring ? "집중 모드 ON — 비허용 앱 차단 중" : "집중 모드 OFF"}
          </Text>
          <MaterialIcons
            name={isMonitoring ? "toggle-on" : "toggle-off"}
            size={28}
            color={isMonitoring ? colors.white : colors.gray300}
            style={styles.monitorToggleIcon}
          />
        </Pressable>

        {/* 탭 + 검색 */}
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tab, selectedTab === "allowed" ? styles.tabActive : styles.tabInactive]}
            onPress={() => setSelectedTab("allowed")}
          >
            <Text style={[styles.tabText, selectedTab === "allowed" ? styles.tabTextActive : styles.tabTextInactive]}>
              허용
            </Text>
            <View style={[styles.tabCount, selectedTab === "allowed" ? styles.tabCountActive : styles.tabCountInactive]}>
              <Text style={[styles.tabCountText, selectedTab === "allowed" ? styles.tabCountTextActive : styles.tabCountTextInactive]}>
                {allowedApps.length}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.tab, selectedTab === "blocked" ? styles.tabActive : styles.tabInactive]}
            onPress={() => setSelectedTab("blocked")}
          >
            <Text style={[styles.tabText, selectedTab === "blocked" ? styles.tabTextActive : styles.tabTextInactive]}>
              비허용
            </Text>
            <View style={[styles.tabCount, selectedTab === "blocked" ? styles.tabCountActive : styles.tabCountInactive]}>
              <Text style={[styles.tabCountText, selectedTab === "blocked" ? styles.tabCountTextActive : styles.tabCountTextInactive]}>
                {blockedApps.length}
              </Text>
            </View>
          </Pressable>

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

        {/* 검색창 */}
        {isSearchActive && (
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={18} color={colors.gray300} />
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
                  <MaterialIcons name="close" size={18} color={colors.gray300} />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* 앱 리스트 */}
        <ScrollView style={styles.appList} showsVerticalScrollIndicator={false}>
          {filteredApps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? "검색 결과가 없어요." : "앱이 없어요."}
              </Text>
            </View>
          ) : (
            filteredApps.map((app) => (
              <View key={app.packageName} style={styles.appItem}>
                {app.icon ? (
                  <Image
                    source={{ uri: app.icon }}
                    style={styles.appIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.appIconPlaceholder}>
                    <MaterialIcons name="apps" size={24} color={colors.gray300} />
                  </View>
                )}

                <View style={styles.appInfo}>
                  <Text style={styles.appName} numberOfLines={1}>{app.name}</Text>
                  <Text style={styles.appPackage} numberOfLines={1}>{app.packageName}</Text>
                </View>

                <Pressable
                  style={[
                    styles.toggleButton,
                    app.isAllowed ? styles.toggleButtonOn : styles.toggleButtonOff,
                  ]}
                  onPress={() => toggleApp(app.packageName)}
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      app.isAllowed ? styles.toggleCircleOn : styles.toggleCircleOff,
                    ]}
                  />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

export default AllowedApps;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1 },

  // 권한 화면
  permContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  permTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    lineHeight: 24,
    color: colors.black,
    textAlign: "center",
  },
  permDesc: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray400,
    textAlign: "center",
  },
  permBold: {
    fontFamily: "Pretendard-Bold",
    color: colors.black,
  },
  permButton: {
    marginTop: 8,
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  permButtonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 15,
    color: colors.white,
  },

  // 로딩
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    lineHeight: 14,
    color: colors.gray300,
  },

  // 모니터링 배너
  monitorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  monitorBannerOn: { backgroundColor: colors.black },
  monitorBannerOff: { backgroundColor: colors.gray100 },
  monitorText: {
    flex: 1,
    fontFamily: "Pretendard-Bold",
    fontSize: 13,
  },
  monitorToggleIcon: { marginLeft: "auto" },

  // 탭
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
  tabActive: { backgroundColor: colors.black },
  tabInactive: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200 },
  tabText: { fontFamily: "Pretendard-Bold", fontSize: 12, lineHeight: 16 },
  tabTextActive: { color: colors.white },
  tabTextInactive: { color: colors.black },
  tabCount: { width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  tabCountActive: { backgroundColor: colors.gray400 },
  tabCountInactive: { backgroundColor: colors.gray100 },
  tabCountText: { fontFamily: "Pretendard-Bold", fontSize: 10, lineHeight: 14 },
  tabCountTextActive: { color: colors.white },
  tabCountTextInactive: { color: colors.black },
  searchToggle: { marginLeft: "auto", width: 28, height: 28, justifyContent: "center", alignItems: "center" },

  // 검색
  searchBarContainer: { paddingHorizontal: 24, paddingBottom: 12 },
  searchBar: {
    width: "100%",
    height: 38,
    backgroundColor: colors.gray100,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: colors.black,
    padding: 0,
  },

  // 앱 목록
  appList: { flex: 1, paddingHorizontal: 24 },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
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
  appInfo: { flex: 1, gap: 2 },
  appName: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.black,
  },
  appPackage: {
    fontFamily: "Pretendard-Regular",
    fontSize: 10,
    lineHeight: 14,
    color: colors.gray300,
  },

  // 토글
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleButtonOn: { backgroundColor: colors.black },
  toggleButtonOff: { backgroundColor: colors.gray200 },
  toggleCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  toggleCircleOn: { alignSelf: "flex-end" },
  toggleCircleOff: { alignSelf: "flex-start" },

  // 빈 상태
  emptyContainer: { paddingTop: 48, alignItems: "center" },
  emptyText: { fontFamily: "Pretendard-Regular", fontSize: 14, lineHeight: 14, color: colors.gray300 },
});

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { getDiscordAuthUrl, verifyMember } from "../services/auth";
import { setTokens } from "../services/api-client";
import { useAuth } from "../context/auth-context";

function Onboarding() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        getDiscordAuthUrl(),
        "masahak://"
      );

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const errorCode = url.searchParams.get("error");
        const discordInviteUrl = url.searchParams.get("discordInviteUrl");

        if (errorCode === "NOT_MEMBER") {
          Alert.alert(
            "가입 필요",
            "디스코드 서버에 먼저 가입해주세요.",
            discordInviteUrl
              ? [
                  { text: "취소", style: "cancel" },
                  {
                    text: "서버 참여",
                    onPress: () =>
                      WebBrowser.openBrowserAsync(discordInviteUrl),
                  },
                ]
              : [{ text: "확인" }]
          );
          return;
        }

        const accessToken = url.searchParams.get("accessToken");
        const refreshToken = url.searchParams.get("refreshToken");
        if (!accessToken || !refreshToken) {
          Alert.alert("오류", "인증 토큰을 받지 못했습니다.");
          return;
        }

        await setTokens(accessToken, refreshToken);

        const isMember = url.searchParams.get("isMember") === "true";
        if (!isMember) {
          navigation.navigate("TermsAgreement");
          return;
        }

        const verifyRes = await verifyMember();
        if (verifyRes.success && verifyRes.data?.isMember) {
          login(verifyRes.data.user);
          // RootNavigator gate auto-switches to Main when isLoggedIn becomes true.
        } else {
          Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
        }
      }
    } catch (error) {
      Alert.alert("오류", "로그인 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigation.navigate("TermsAgreement");
  };

  return (
    <View
      style={[
        styles.layout,
        {
          paddingTop: insets.top + 80,
          paddingBottom: Math.max(insets.bottom + 24, 40),
        },
      ]}
    >
      <Text style={styles.welcome}>
        마법사관학교에{"\n"}오신 것을{"\n"}환영합니다.
      </Text>

      <View style={styles.illustrationPlaceholder} />

      <View style={styles.buttonBox}>
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleDiscordLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size={24} color={colors.white} style={styles.iconContainer} />
          ) : (
            <View style={styles.iconContainer}>
              <MaterialIcons name="discord" size={28} color={colors.purple} />
            </View>
          )}
          <Text style={styles.buttonText}>디스코드로 로그인</Text>
        </Pressable>
        <Pressable onPress={handleGuestLogin} hitSlop={12}>
          <Text style={styles.guestText}>게스트 로그인</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default Onboarding;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  welcome: {
    fontFamily: "Pretendard-Bold",
    fontSize: 36,
    lineHeight: 48,
    color: colors.black,
  },
  illustrationPlaceholder: {
    flex: 1,
    width: "100%",
    maxHeight: 550,
    marginVertical: 24,
    backgroundColor: "#D9D9D9",
  },
  buttonBox: {
    gap: 10,
    alignItems: "center",
  },
  button: {
    width: "100%",
    maxWidth: 342,
    height: 70,
    flexDirection: "row",
    borderRadius: 35,
    backgroundColor: colors.black,
    paddingLeft: 32,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    flex: 1,
    textAlign: "center",
    color: colors.white,
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
  },
  iconContainer: {
    width: 46,
    height: 46,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  guestText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 12,
    color: colors.gray300,
    textAlign: "center",
    marginTop: 4,
  },
});

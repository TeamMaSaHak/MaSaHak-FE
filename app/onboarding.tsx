import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { getDiscordLoginUrl, loginWithDiscordCallback } from "../services/auth";
import { useAuth } from "../context/auth-context";

function Onboarding() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const urlRes = await getDiscordLoginUrl();
      if (!urlRes.success || !urlRes.data?.redirectUrl) {
        Alert.alert("오류", "디스코드 로그인 URL을 가져올 수 없습니다.");
        setIsLoading(false);
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        urlRes.data.redirectUrl,
        "masahak://"
      );

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get("code");

        if (!code) {
          Alert.alert("오류", "인증 코드를 받지 못했습니다.");
          setIsLoading(false);
          return;
        }

        const res = await loginWithDiscordCallback(code);

        if (res.success && res.data) {
          if (res.data.isMember) {
            login(res.data.user);
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          } else {
            navigation.navigate("TermsAgreement");
          }
        } else if (res.error?.code === "NOT_MEMBER") {
          if (res.discordInviteUrl) {
            Alert.alert(
              "가입 필요",
              "디스코드 서버에 먼저 가입해주세요.",
              [
                { text: "취소", style: "cancel" },
                {
                  text: "서버 참여",
                  onPress: () =>
                    WebBrowser.openBrowserAsync(res.discordInviteUrl!),
                },
              ]
            );
          } else {
            navigation.navigate("TermsAgreement");
          }
        } else {
          Alert.alert("오류", res.error?.message || "로그인에 실패했습니다.");
        }
      }
    } catch (error) {
      Alert.alert("오류", "로그인 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = () => {
    console.log("애플로 로그인 - 추후 구현 예정");
  };

  const handleGuestLogin = () => {
    navigation.navigate("TermsAgreement");
  };

  return (
    <View style={styles.layout}>
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
        <Pressable style={styles.button} onPress={handleAppleLogin}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="apple" size={28} color={colors.black} />
          </View>
          <Text style={styles.buttonText}>애플로 로그인</Text>
        </Pressable>
        <Pressable onPress={handleGuestLogin}>
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
    paddingTop: 150,
    paddingBottom: 100,
    justifyContent: "space-between",
  },
  welcome: {
    fontFamily: "Pretendard-Bold",
    fontSize: 36,
    lineHeight: 48,
    color: colors.black,
  },
  illustrationPlaceholder: {
    width: 390,
    height: 550,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
  },
  buttonBox: {
    gap: 10,
    alignItems: "center",
  },
  button: {
    width: 342,
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

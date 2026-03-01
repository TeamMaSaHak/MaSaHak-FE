import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../constants/colors";

function Onboarding() {
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    navigation.navigate("TermsAgreement");
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
        <Pressable style={styles.button} onPress={handleLogin}>
          <View style={styles.icon} />
          <Text style={styles.buttonText}>디스코드로 로그인</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleLogin}>
          <View style={styles.icon} />
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
  buttonText: {
    flex: 1,
    textAlign: "center",
    color: colors.white,
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
  },
  icon: {
    width: 46,
    height: 46,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  guestText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 12,
    color: colors.gray300,
    textAlign: "center",
    marginTop: 4,
  },
});

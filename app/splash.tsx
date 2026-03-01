import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoPlaceholder} />
      <Text style={styles.title}>마법사관학교</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: colors.gray200,
    borderRadius: 8,
  },
  title: {
    fontFamily: "Pretendard-Bold",
    fontSize: 28,
    color: colors.black,
    marginTop: 24,
  },
});

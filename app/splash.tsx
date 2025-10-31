import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // 2초 후 스플래시 종료
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/splash-icon.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
});

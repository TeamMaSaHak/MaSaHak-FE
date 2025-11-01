import { StyleSheet } from "react-native";
import React, { useState } from "react";
import SplashScreen from "./app/splash";
import { NavigationContainer } from "@react-navigation/native";
import { BottomTab } from "./components/bottom-tab";

export default function App() {
  const [isSplash, setIsSplash] = useState(true);

  if (isSplash) {
    return <SplashScreen onFinish={() => setIsSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <BottomTab />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 24,
  },
});

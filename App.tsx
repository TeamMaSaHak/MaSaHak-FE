import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import SplashScreen from "./app/splash";
import Onboarding from "./app/onboarding";
import Home from "./app/home";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Expo 기본 아이콘
import Calendar from "./app/calendar";
import Profile from "./app/profile";
import { BottomTab } from "./components/bottom-tab";

export default function App() {
  const [isSplash, setIsSplash] = useState(true);

  if (isSplash) {
    return <SplashScreen onFinish={() => setIsSplash(false)} />;
  }

  const Tab = createBottomTabNavigator();

  return <NavigationContainer></NavigationContainer>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 24,
  },
});

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Home from "../app/home";
import Calendar from "../app/calendar";
import Profile from "../app/profile";
import { colors } from "../constants/colors";
import { Dimensions, StyleSheet } from "react-native";

const Tab = createBottomTabNavigator();

export const BottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: styles.container,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "홈") {
            iconName = "home";
          } else if (route.name === "캘린더") {
            iconName = "calendar";
          } else if (route.name === "프로필") {
            iconName = "person";
          }

          return <Ionicons name={iconName} size={32} color={color} />;
        },
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="캘린더" component={Calendar} />
      <Tab.Screen name="홈" component={Home} />
      <Tab.Screen name="프로필" component={Profile} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 45,
    backgroundColor: colors.white,
    bottom: 34,
    width: Dimensions.get("window").width - 48,
    alignSelf: "center",
    height: 60,
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 56,
  },
});

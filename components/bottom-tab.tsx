import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import Home from "../app/home";
import Calendar from "../app/calendar";
import Diary from "../app/diary";
import Profile from "../app/profile";
import Todolist from "../app/todolist";
import Terms from "../app/terms";
import Privacy from "../app/privacy";
import { colors } from "../constants/colors";
import { Dimensions, StyleSheet } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Calendar Stack Navigator
const CalendarStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain" component={Calendar} />
      <Stack.Screen name="Diary" component={Diary} />
    </Stack.Navigator>
  );
};

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="Todolist" component={Todolist} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={Profile} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="Privacy" component={Privacy} />
    </Stack.Navigator>
  );
};

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
      <Tab.Screen name="캘린더" component={CalendarStack} />
      <Tab.Screen name="홈" component={HomeStack} />
      <Tab.Screen name="프로필" component={ProfileStack} />
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

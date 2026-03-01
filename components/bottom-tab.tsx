import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

import Home from "../app/home";
import Calendar from "../app/calendar";
import Diary from "../app/diary";
import Profile from "../app/profile";
import Todolist from "../app/todolist";
import Terms from "../app/terms";
import Privacy from "../app/privacy";
import Notifications from "../app/notifications";
import AllowedApps from "../app/allowed-apps";
import { colors } from "../constants/colors";

const Tab = createBottomTabNavigator();

const CalendarStackNav = createStackNavigator();
const HomeStackNav = createStackNavigator();
const ProfileStackNav = createStackNavigator();

const CalendarStack = () => {
  return (
    <CalendarStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CalendarStackNav.Screen name="CalendarMain" component={Calendar} />
      <CalendarStackNav.Screen name="Diary" component={Diary} />
    </CalendarStackNav.Navigator>
  );
};

const HomeStack = () => {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={Home} />
      <HomeStackNav.Screen name="Todolist" component={Todolist} />
    </HomeStackNav.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={Profile} />
      <ProfileStackNav.Screen name="Terms" component={Terms} />
      <ProfileStackNav.Screen name="Privacy" component={Privacy} />
      <ProfileStackNav.Screen name="Notifications" component={Notifications} />
      <ProfileStackNav.Screen name="AllowedApps" component={AllowedApps} />
    </ProfileStackNav.Navigator>
  );
};

type TabIconName = "calendar-today" | "home" | "person";

const TAB_ICONS: Record<string, TabIconName> = {
  "\uCE98\uB9B0\uB354": "calendar-today",
  "\uD648": "home",
  "\uD504\uB85C\uD544": "person",
};

export const BottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: styles.container,
        tabBarShowLabel: false,
        tabBarIcon: ({ color }) => {
          const iconName = TAB_ICONS[route.name] ?? "home";
          return <MaterialIcons name={iconName} size={32} color={color} />;
        },
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.gray300,
        headerShown: false,
      })}
    >
      <Tab.Screen name={"\uCE98\uB9B0\uB354"} component={CalendarStack} />
      <Tab.Screen name={"\uD648"} component={HomeStack} />
      <Tab.Screen name={"\uD504\uB85C\uD544"} component={ProfileStack} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 342,
    height: 60,
    borderRadius: 45,
    backgroundColor: colors.white,
    bottom: 34,
    left: (390 - 342) / 2,
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 56,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
  },
});

import React, { useState } from "react";
import { View, ActivityIndicator, Platform, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./context/auth-context";
import SplashScreen from "./app/splash";
import Onboarding from "./app/onboarding";
import TermsAgreement from "./app/terms-agreement";
import PrivacyAgreement from "./app/privacy-agreement";
import CountrySelect from "./app/country-select";
import { BottomTab } from "./components/bottom-tab";
import { colors } from "./constants/colors";

// Show notifications as banners even when the app is in the foreground.
if (Platform.OS !== "web") {
  // Lazy import so web bundle doesn't pull in native module.
  import("expo-notifications").then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }).catch(() => {});
}

const Stack = createStackNavigator();

function RootNavigator() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={BottomTab} />
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="TermsAgreement" component={TermsAgreement} />
          <Stack.Screen name="PrivacyAgreement" component={PrivacyAgreement} />
          <Stack.Screen name="CountrySelect" component={CountrySelect} />
          <Stack.Screen name="Main" component={BottomTab} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [isSplash, setIsSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("./assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("./assets/fonts/Pretendard-Bold.otf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  if (isSplash) {
    return <SplashScreen onFinish={() => setIsSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
});

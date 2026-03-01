import React, { useState, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "./app/splash";
import Onboarding from "./app/onboarding";
import TermsAgreement from "./app/terms-agreement";
import PrivacyAgreement from "./app/privacy-agreement";
import CountrySelect from "./app/country-select";
import { BottomTab } from "./components/bottom-tab";
import { colors } from "./constants/colors";

const Stack = createStackNavigator();

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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="TermsAgreement" component={TermsAgreement} />
        <Stack.Screen name="PrivacyAgreement" component={PrivacyAgreement} />
        <Stack.Screen name="CountrySelect" component={CountrySelect} />
        <Stack.Screen name="Main" component={BottomTab} />
      </Stack.Navigator>
    </NavigationContainer>
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

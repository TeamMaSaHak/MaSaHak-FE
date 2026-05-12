import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { registerFcmToken } from "./devices";
import { getAccessToken } from "./api-client";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export async function registerPushToken(): Promise<void> {
    if (Platform.OS === "web") return;
    if (isExpoGo) return;

    const token = await getAccessToken();
    if (!token) return;

    try {
        const Notifications = await import("expo-notifications");
        const messagingModule = await import("@react-native-firebase/messaging");
        const messaging = messagingModule.default;

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.DEFAULT,
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") return;

        if (Platform.OS === "ios") {
            await messaging().registerDeviceForRemoteMessages();
            const apnsToken = await messaging().getAPNSToken();
            if (!apnsToken) return;
        }

        const fcmToken = await messaging().getToken();
        await registerFcmToken(fcmToken, Platform.OS as "ios" | "android");
    } catch (e) {
        console.error("Push token registration failed:", e);
    }
}

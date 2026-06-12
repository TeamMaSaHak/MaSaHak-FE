import { Platform } from "react-native";
import { requireNativeModule } from "expo-modules-core";

const AppMonitorNative = Platform.OS === "android"
  ? requireNativeModule("AppMonitor")
  : null;

export interface InstalledApp {
  packageName: string;
  name: string;
  icon: string | null;
}

export function getInstalledApps(): Promise<InstalledApp[]> {
  return AppMonitorNative?.getInstalledApps() ?? Promise.resolve([]);
}

export function checkUsageStatsPermission(): Promise<boolean> {
  return AppMonitorNative?.checkUsageStatsPermission() ?? Promise.resolve(false);
}

export function requestUsageStatsPermission(): Promise<void> {
  return AppMonitorNative?.requestUsageStatsPermission() ?? Promise.resolve();
}

export function checkOverlayPermission(): Promise<boolean> {
  return AppMonitorNative?.checkOverlayPermission() ?? Promise.resolve(false);
}

export function requestOverlayPermission(): Promise<void> {
  return AppMonitorNative?.requestOverlayPermission() ?? Promise.resolve();
}

export function startMonitoring(blockedPackages: string[]): Promise<void> {
  return AppMonitorNative?.startMonitoring(blockedPackages) ?? Promise.resolve();
}

export function stopMonitoring(): Promise<void> {
  return AppMonitorNative?.stopMonitoring() ?? Promise.resolve();
}

export function updateBlockedPackages(blockedPackages: string[]): Promise<void> {
  return AppMonitorNative?.updateBlockedPackages(blockedPackages) ?? Promise.resolve();
}

export function isMonitoringActive(): Promise<boolean> {
  return AppMonitorNative?.isMonitoringActive() ?? Promise.resolve(false);
}

import { requireNativeModule } from "expo-modules-core";

const AppMonitorNative = requireNativeModule("AppMonitor");

export interface InstalledApp {
  packageName: string;
  name: string;
  icon: string | null;
}

export function getInstalledApps(): Promise<InstalledApp[]> {
  return AppMonitorNative.getInstalledApps();
}

export function checkUsageStatsPermission(): Promise<boolean> {
  return AppMonitorNative.checkUsageStatsPermission();
}

export function requestUsageStatsPermission(): Promise<void> {
  return AppMonitorNative.requestUsageStatsPermission();
}

export function checkOverlayPermission(): Promise<boolean> {
  return AppMonitorNative.checkOverlayPermission();
}

export function requestOverlayPermission(): Promise<void> {
  return AppMonitorNative.requestOverlayPermission();
}

export function startMonitoring(blockedPackages: string[]): Promise<void> {
  return AppMonitorNative.startMonitoring(blockedPackages);
}

export function stopMonitoring(): Promise<void> {
  return AppMonitorNative.stopMonitoring();
}

export function updateBlockedPackages(blockedPackages: string[]): Promise<void> {
  return AppMonitorNative.updateBlockedPackages(blockedPackages);
}

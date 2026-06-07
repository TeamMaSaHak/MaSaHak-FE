import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getInstalledApps as nativeGetInstalledApps,
  startMonitoring as nativeStart,
  stopMonitoring as nativeStop,
  updateBlockedPackages as nativeUpdate,
  InstalledApp,
} from "../modules/app-monitor";

const STORAGE_KEY = "masahak_allowed_packages";

export type { InstalledApp };

export interface AppWithStatus extends InstalledApp {
  isAllowed: boolean;
}

export async function loadAppsWithStatus(): Promise<AppWithStatus[]> {
  const [installedApps, savedJson] = await Promise.all([
    nativeGetInstalledApps(),
    AsyncStorage.getItem(STORAGE_KEY),
  ]);

  // 저장된 허용 목록 (없으면 모두 비허용)
  const allowedSet: Set<string> = savedJson
    ? new Set(JSON.parse(savedJson) as string[])
    : new Set();

  return installedApps.map((app) => ({
    ...app,
    isAllowed: allowedSet.has(app.packageName),
  }));
}

export async function saveAllowedPackages(
  allowedPackages: string[]
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allowedPackages));
}

export async function startAppMonitoring(
  apps: AppWithStatus[]
): Promise<void> {
  const blocked = apps
    .filter((a) => !a.isAllowed)
    .map((a) => a.packageName);
  await nativeStart(blocked);
}

export async function stopAppMonitoring(): Promise<void> {
  await nativeStop();
}

export async function syncMonitoringList(
  apps: AppWithStatus[]
): Promise<void> {
  const blocked = apps
    .filter((a) => !a.isAllowed)
    .map((a) => a.packageName);
  await nativeUpdate(blocked);
}

import { get, post, put } from "./api-client";

interface PomodoroSession {
  sessionId: number;
  startedAt: string;
  focusTime: number;
  breakTime: number;
  repeatCount: number;
}

interface PomodoroStopResult {
  sessionId: number;
  durationSeconds: number;
  completedCycles: number;
  startedAt: string;
  endedAt: string;
}

interface CycleCompleteResult {
  sessionId: number;
  cycleNumber: number;
  isLastCycle: boolean;
  nextPhase: "focus" | "break";
}

export interface PomodoroSettings {
  focusTime: number;
  breakTime: number;
  repeatCount: number;
}

export function startPomodoro(opts?: {
  startedAt?: string;
  focusTime?: number;
  breakTime?: number;
  repeatCount?: number;
}) {
  return post<PomodoroSession>("/api/pomodoro/start", opts || {});
}

export function stopPomodoro(
  sessionId: number,
  durationSeconds: number,
  completedCycles: number,
  endedAt?: string
) {
  return post<PomodoroStopResult>("/api/pomodoro/stop", {
    sessionId,
    durationSeconds,
    completedCycles,
    ...(endedAt ? { endedAt } : {}),
  });
}

export function completeCycle(
  sessionId: number,
  cycleNumber: number,
  focusDurationSeconds: number
) {
  return post<CycleCompleteResult>("/api/pomodoro/cycle-complete", {
    sessionId,
    cycleNumber,
    focusDurationSeconds,
  });
}

export function getSettings() {
  return get<PomodoroSettings>("/api/pomodoro/settings");
}

export function saveSettings(settings: PomodoroSettings) {
  return put<PomodoroSettings>("/api/pomodoro/settings", settings);
}

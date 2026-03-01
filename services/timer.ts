import { post } from "./api-client";

interface TimerSession {
  sessionId: number;
  startedAt: string;
}

interface TimerStopResult {
  sessionId: number;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
}

export function startTimer(startedAt?: string) {
  return post<TimerSession>("/api/timer/start", startedAt ? { startedAt } : {});
}

export function stopTimer(sessionId: number, durationSeconds: number, endedAt?: string) {
  return post<TimerStopResult>("/api/timer/stop", {
    sessionId,
    durationSeconds,
    ...(endedAt ? { endedAt } : {}),
  });
}

export function pauseTimer(sessionId: number) {
  return post<{ message: string }>("/api/timer/pause", { sessionId });
}

export function resumeTimer(sessionId: number) {
  return post<{ message: string }>("/api/timer/resume", { sessionId });
}

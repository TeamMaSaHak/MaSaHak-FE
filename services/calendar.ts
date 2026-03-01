import { get } from "./api-client";

export interface MonthlyStats {
  year: number;
  month: number;
  attendanceDays: number;
  totalDaysInMonth: number;
  totalMinutes: number;
  averageMinutesPerDay: number;
  completedTodos: number;
}

export interface DailyStats {
  date: string;
  totalMinutes: number;
  diffFromYesterday: number;
  firstStartTime: string;
  longestSessionMinutes: number;
}

export interface CalendarDay {
  date: string;
  totalMinutes: number;
  hasDiary: boolean;
}

interface MonthlyCalendarData {
  year: number;
  month: number;
  days: CalendarDay[];
}

export function getMonthlyStats(year: number, month: number) {
  return get<MonthlyStats>(
    `/api/calendar/stats/monthly?year=${year}&month=${month}`
  );
}

export function getDailyStats(date: string) {
  return get<DailyStats>(`/api/calendar/stats/daily?date=${date}`);
}

export function getMonthlyCalendar(year: number, month: number) {
  return get<MonthlyCalendarData>(`/api/calendar/${year}/${month}`);
}

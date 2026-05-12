import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import { getMonthlyCalendar, getMonthlyStats, getDailyStats, DailyStats } from "../services/calendar";

function Calendar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const cellWidth = Math.floor((screenWidth - 48) / 7); // 48 = paddingHorizontal 24 * 2
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);

  // Attendance dates (dates the user was present / studied)
  const [attendanceDates, setAttendanceDates] = useState<Set<string>>(
    new Set()
  );

  // Monthly stats
  const [monthlyStats, setMonthlyStats] = useState([
    { title: "공부한 시간", value: "-", unit: "" },
    { title: "전일 대비 공부한 시간", value: "-", unit: "" },
    { title: "공부 시작 시간", value: "-", unit: "" },
    { title: "가장 길게 집중한 시간", value: "-", unit: "" },
  ]);

  const fetchCalendarData = useCallback(async () => {
    const apiMonth = currentMonth + 1; // convert 0-indexed to 1-indexed

    try {
      const calendarRes = await getMonthlyCalendar(currentYear, apiMonth);
      if (calendarRes.success && calendarRes.data) {
        const dates = new Set(
          calendarRes.data.days
            .filter((day) => day.totalMinutes > 0)
            .map((day) => day.date)
        );
        setAttendanceDates(dates);
      }
    } catch (e) {
      console.error("Failed to fetch monthly calendar:", e);
    }

    try {
      const statsRes = await getMonthlyStats(currentYear, apiMonth);
      if (statsRes.success && statsRes.data) {
        const s = statsRes.data;
        const totalHrs = Math.floor(s.totalMinutes / 60);
        const totalMins = s.totalMinutes % 60;
        const avgHrs = Math.floor(s.averageMinutesPerDay / 60);
        const avgMins = s.averageMinutesPerDay % 60;
        setMonthlyStats([
          { title: "공부한 시간", value: totalHrs > 0 ? `${totalHrs}시간 ${totalMins}분` : `${totalMins}분`, unit: "" },
          { title: "전일 대비 공부한 시간", value: "-", unit: "" },
          { title: "공부 시작 시간", value: "-", unit: "" },
          { title: "가장 길게 집중한 시간", value: "-", unit: "" },
        ]);
      }
    } catch (e) {
      console.error("Failed to fetch monthly stats:", e);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay(); // 0 = Sunday

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const changeMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    setSelectedDate(null);
  };

  const formatDateString = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  const hasAttendance = (day: number) =>
    attendanceDates.has(formatDateString(day));

  const selectDate = async (day: number) => {
    setSelectedDate(day);
    setDailyStats(null);
    const dateStr = formatDateString(day);
    try {
      const res = await getDailyStats(dateStr);
      if (res.success && res.data) {
        setDailyStats(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch daily stats:", e);
    }
  };

  const handleGoToDiary = () => {
    // If no date picked, default to today so the button is never a no-op.
    let dateStr: string;
    if (selectedDate != null) {
      dateStr = formatDateString(selectedDate);
    } else {
      const t = new Date();
      const m = String(t.getMonth() + 1).padStart(2, "0");
      const d = String(t.getDate()).padStart(2, "0");
      dateStr = `${t.getFullYear()}-${m}-${d}`;
    }
    (navigation as any).navigate("Diary", { date: dateStr });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 50 }]}>
      <Topbar
        title="캘린더"
        right={<MaterialIcons name="mail" size={22} color={colors.black} />}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 260 }} showsVerticalScrollIndicator={false}>
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <Pressable onPress={() => changeMonth("prev")}>
            <MaterialIcons
              name="arrow-back-ios-new"
              size={14}
              color={colors.black}
            />
          </Pressable>
          <Text style={styles.monthText}>
            {currentYear}.{String(currentMonth + 1).padStart(2, "0")}
          </Text>
          <Pressable onPress={() => changeMonth("next")}>
            <MaterialIcons
              name="arrow-forward-ios"
              size={14}
              color={colors.black}
            />
          </Pressable>
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarContainer}>
          {/* Weekday header */}
          <View style={styles.weekDaysRow}>
            {weekDays.map((day) => (
              <View key={day} style={[styles.weekDayCell, { width: cellWidth }]}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Day cells */}
          <View style={[styles.daysGrid, { width: cellWidth * 7 }]}>
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate === day && day !== null;
              const attended = day !== null && hasAttendance(day);

              return (
                <Pressable
                  key={index}
                  style={[
                    styles.dayCell,
                    { width: cellWidth },
                    isSelected && styles.dayCellSelected,
                    !isSelected && attended && styles.dayCellAttendance,
                  ]}
                  onPress={() => day !== null && selectDate(day)}
                  disabled={day === null}
                >
                  {day !== null && (
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Daily stats (when date selected) */}
        {selectedDate != null && dailyStats && (
          <View style={styles.dailyStatsContainer}>
            <Text style={styles.dailyStatsTitle}>
              {formatDateString(selectedDate)} 상세
            </Text>
            <View style={styles.dailyStatsGrid}>
              <View style={styles.dailyStatItem}>
                <Text style={styles.dailyStatValue}>{dailyStats.totalMinutes}분</Text>
                <Text style={styles.dailyStatLabel}>총 집중 시간</Text>
              </View>
              <View style={styles.dailyStatItem}>
                <Text style={styles.dailyStatValue}>
                  {dailyStats.diffFromYesterday > 0 ? "+" : ""}
                  {dailyStats.diffFromYesterday}분
                </Text>
                <Text style={styles.dailyStatLabel}>어제 대비</Text>
              </View>
              <View style={styles.dailyStatItem}>
                <Text style={styles.dailyStatValue}>{dailyStats.longestSessionMinutes}분</Text>
                <Text style={styles.dailyStatLabel}>최장 세션</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats section */}
        <Text style={{ fontFamily: "Pretendard-Bold", fontSize: 14, color: colors.black, marginBottom: 12 }}>월 통계</Text>
        <View style={styles.statsContainer}>
          {monthlyStats.map(({ title, value, unit }, i) => (
            <View
              key={title}
              style={[
                styles.statsRow,
                i < monthlyStats.length - 1 && styles.statsRowBorder,
              ]}
            >
              <Text style={styles.statsLabel}>{title}</Text>
              <Text style={styles.statsValue}>
                {value}
                {unit}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom button */}
      <Pressable style={styles.bottomButton} onPress={handleGoToDiary}>
        <Text style={styles.bottomButtonText}>일기 보러 가기</Text>
      </Pressable>
    </View>
  );
}

// Calendar cells adapt to screen width: (screenWidth - 48px padding) / 7
// On 375px screen: (375-48)/7 ≈ 46.7px per cell
// On 393px screen: (393-48)/7 = 49.3px per cell (matches Figma)
const CELL_WIDTH = 49;
const CELL_HEIGHT = 63;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  monthText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: colors.black,
  },
  calendarContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  weekDayCell: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  weekDayText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    color: colors.black,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCell: {
    height: CELL_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCellSelected: {
    backgroundColor: colors.black,
  },
  dayCellAttendance: {
    backgroundColor: colors.gray200,
  },
  dayText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    color: colors.black,
  },
  dayTextSelected: {
    color: colors.white,
  },
  statsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  statsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  statsLabel: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    color: colors.black,
  },
  statsValue: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    color: colors.black,
  },
  dailyStatsContainer: {
    width: "100%",
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  dailyStatsTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 12,
    color: colors.black,
    marginBottom: 12,
  },
  dailyStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dailyStatItem: {
    alignItems: "center",
    flex: 1,
  },
  dailyStatValue: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
  dailyStatLabel: {
    fontFamily: "Pretendard-Regular",
    fontSize: 10,
    color: colors.gray300,
  },
  bottomButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    width: 240,
    height: 50,
    backgroundColor: colors.black,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomButtonText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: colors.white,
  },
});

export default Calendar;

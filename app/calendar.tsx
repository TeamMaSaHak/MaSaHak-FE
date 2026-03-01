import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import { getMonthlyCalendar, getMonthlyStats } from "../services/calendar";

function Calendar() {
  const navigation = useNavigation();
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (6 = July)
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Attendance dates (dates the user was present / studied)
  const [attendanceDates, setAttendanceDates] = useState<Set<string>>(
    new Set()
  );

  // Monthly stats
  const [monthlyStats, setMonthlyStats] = useState([
    { title: "이번 달 총 출석 횟수", value: 0, unit: "회" },
    { title: "이번 달 총 집중 시간", value: 0, unit: "분" },
    { title: "이번 달 평균 집중 시간", value: 0, unit: "분" },
    { title: "이번 달 완료한 투두 리스트 수", value: 0, unit: "개" },
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
        setMonthlyStats([
          { title: "이번 달 총 출석 횟수", value: s.attendanceDays, unit: "회" },
          { title: "이번 달 총 집중 시간", value: s.totalMinutes, unit: "분" },
          {
            title: "이번 달 평균 집중 시간",
            value: s.averageMinutesPerDay,
            unit: "분",
          },
          {
            title: "이번 달 완료한 투두 리스트 수",
            value: s.completedTodos,
            unit: "개",
          },
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

  const selectDate = (day: number) => {
    setSelectedDate(day);
  };

  const handleGoToDiary = () => {
    if (selectedDate == null) return;
    const dateStr = formatDateString(selectedDate);
    (navigation as any).navigate("Diary", { date: dateStr });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <View style={styles.container}>
      <Topbar
        title="캘린더"
        right={<MaterialIcons name="mail" size={22} color={colors.black} />}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              <View key={day} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Day cells */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate === day && day !== null;
              const attended = day !== null && hasAttendance(day);

              return (
                <Pressable
                  key={index}
                  style={[
                    styles.dayCell,
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

        {/* Stats section */}
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

const CELL_WIDTH = 49;
const CELL_HEIGHT = 63;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
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
    width: CELL_WIDTH,
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
    width: CELL_WIDTH * 7,
  },
  dayCell: {
    width: CELL_WIDTH,
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
    marginBottom: 120,
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
  bottomButton: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    width: 240,
    height: 50,
    backgroundColor: colors.black,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomButtonText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: colors.white,
  },
});

export default Calendar;

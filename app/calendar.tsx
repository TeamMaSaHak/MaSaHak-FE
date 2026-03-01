import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";

interface DiaryEntry {
  date: string; // YYYY-MM-DD
  content: string;
  aiReply?: string;
}

function Calendar() {
  const navigation = useNavigation();
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (6 = July)
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Mock data
  const [diaries] = useState<DiaryEntry[]>([
    {
      date: "2025-07-03",
      content:
        "오늘은 정말 집중이 잘 됐다. 뽀모도로 3세트를 완료하고 투두리스트도 5개나 완료했다.",
      aiReply:
        "오늘 정말 생산적인 하루를 보내셨네요! 뽀모도로 3세트와 투두 5개 완료는 대단한 성과입니다.",
    },
    {
      date: "2025-07-10",
      content: "오늘은 좀 힘들었다. 집중이 잘 안돼서 뽀모도로 1세트만 겨우 완료했다.",
    },
    {
      date: "2025-07-15",
      content: "새로운 프로젝트를 시작했다. 기대가 된다!",
      aiReply: "새로운 시작은 언제나 설레는 법이죠! 화이팅하세요!",
    },
  ]);

  // Attendance dates (dates the user was present / studied)
  const attendanceDates = new Set(["2025-07-03", "2025-07-10", "2025-07-15"]);

  // Monthly stats (default 0 per spec)
  const monthlyStats = [
    { title: "이번 달 총 출석 횟수", value: 0, unit: "회" },
    { title: "이번 달 총 집중 시간", value: 0, unit: "분" },
    { title: "이번 달 평균 집중 시간", value: 0, unit: "분" },
    { title: "이번 달 완료한 투두 리스트 수", value: 0, unit: "개" },
  ];

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

import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Arrow, Blank, Mail } from "../assets/icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";

type ViewMode = "calendar" | "diary" | "aiReply";

interface DiaryEntry {
  date: string; // YYYY-MM-DD format
  content: string;
  aiReply?: string;
}

function Calendar() {
  const navigation = useNavigation();
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed (9 = October)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  // Mock data - 실제 앱에서는 API나 로컬 스토리지에서 가져옴
  const [diaries] = useState<DiaryEntry[]>([
    {
      date: "2024-09-15",
      content:
        "오늘은 정말 집중이 잘 됐다. 뽀모도로 3세트를 완료하고 투두리스트도 5개나 완료했다. 내일도 이런 컨디션이면 좋겠다.",
      aiReply:
        "오늘 정말 생산적인 하루를 보내셨네요! 뽀모도로 3세트와 투두 5개 완료는 대단한 성과입니다. 이런 리듬을 유지하시려면 충분한 휴식도 중요하니 내일도 파이팅하세요!",
    },
    {
      date: "2024-09-20",
      content:
        "오늘은 좀 힘들었다. 집중이 잘 안돼서 뽀모도로 1세트만 겨우 완료했다. 내일은 더 잘할 수 있을 것 같다.",
      aiReply:
        "모든 날이 완벽할 수는 없어요. 힘든 날에도 1세트를 완료하신 것 자체가 대단합니다. 내일을 위해 오늘은 푹 쉬세요!",
    },
  ]);

  // Mock statistics
  const monthlyStats = {
    focusCount: 24,
    focusTime: 600, // 분
    focusDays: 12,
    completedTodos: 45,
    averageFocusTime: 50, // 분
  };

  const monthlyStatsMeta = [
    { title: "이번 달 집중 횟수", value: monthlyStats.focusCount, unit: "회" },
    { title: "이번 달 집중 시간", value: monthlyStats.focusTime, unit: "분" },
    { title: "이번 달 집중한 날", value: monthlyStats.focusDays, unit: "일" },
    {
      title: "완료한 투두리스트 수",
      value: monthlyStats.completedTodos,
      unit: "개",
    },
    {
      title: "평균 집중 시간",
      value: monthlyStats.averageFocusTime,
      unit: "분",
    },
  ];

  // 달력 날짜 생성
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    // 빈 칸 추가 (일요일부터 시작)
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 날짜 추가
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // 월 이동
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

  // 날짜 선택
  const selectDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
  };

  // 일기 존재 여부 확인
  const getDiaryForDate = (date: Date | null) => {
    if (!date) return null;
    const dateString = formatDateToString(date);
    return diaries.find((d) => d.date === dateString);
  };

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 오늘 날짜인지 확인
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // 오늘 날짜에 일기가 있는지 확인
  const hasTodayDiary = () => {
    const today = new Date();
    const todayString = formatDateToString(today);
    return diaries.some((d) => d.date === todayString);
  };

  // 오늘 일기 쓰러 가기
  const goToWriteTodayDiary = () => {
    const today = new Date();
    navigation.navigate("Diary" as never, { date: formatDateToString(today) } as never);
  };

  // 일기 날짜 네비게이션
  const navigateDiary = (direction: "prev" | "next") => {
    if (!selectedDate) return;

    const currentDateString = formatDateToString(selectedDate);
    const currentIndex = diaries.findIndex((d) => d.date === currentDateString);

    if (direction === "prev" && currentIndex > 0) {
      const prevDiary = diaries[currentIndex - 1];
      const [year, month, day] = prevDiary.date.split("-").map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    } else if (direction === "next" && currentIndex < diaries.length - 1) {
      const nextDiary = diaries[currentIndex + 1];
      const [year, month, day] = nextDiary.date.split("-").map(Number);
      setSelectedDate(new Date(year, month - 1, day));
    }
  };

  const currentDiary = getDiaryForDate(selectedDate);
  const calendarDays = generateCalendarDays();
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 달력 뷰
  if (viewMode === "calendar") {
    return (
      <View style={styles.container}>
        <Topbar
          title="캘린더"
          left={<Blank size={22} />}
          right={<Mail size={22} />}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* 월 네비게이션 */}
          <View style={styles.moveMonthBox}>
            <Pressable onPress={() => changeMonth("prev")}>
              <Arrow size={14} direction="left" />
            </Pressable>
            <Text style={styles.monthText}>
              {currentYear}.{String(currentMonth + 1).padStart(2, "0")}
            </Text>
            <Pressable onPress={() => changeMonth("next")}>
              <Arrow size={14} />
            </Pressable>
          </View>

          {/* 달력 그리드 */}
          <View style={styles.calendarContainer}>
            {/* 요일 헤더 */}
            <View style={styles.weekDaysRow}>
              {weekDays.map((day) => (
                <View key={day} style={styles.weekDayBox}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* 날짜 그리드 */}
            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) => {
                const isSelected =
                  selectedDate &&
                  selectedDate.getFullYear() === currentYear &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getDate() === day;

                const date = day
                  ? new Date(currentYear, currentMonth, day)
                  : null;
                const hasDiary = date && getDiaryForDate(date);

                return (
                  <Pressable
                    key={index}
                    style={[styles.dayBox, isSelected && styles.dayBoxSelected]}
                    onPress={() => day && selectDate(day)}
                    disabled={!day}
                  >
                    {day && (
                      <>
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextSelected,
                          ]}
                        >
                          {day}
                        </Text>
                        {hasDiary && <View style={styles.diaryIndicator} />}
                      </>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 월간 통계 */}
          <View style={styles.monthlyStatsContainer}>
            {monthlyStatsMeta.map(({ title, value, unit }, i) => (
              <View
                key={title}
                style={[
                  styles.monthlyStatsBox,
                  {
                    borderBottomWidth:
                      i === monthlyStatsMeta.length - 1 ? 0 : 1,
                  },
                ]}
              >
                <Text style={styles.monthlyStatsText}>{title}</Text>
                <Text style={styles.monthlyStatsText}>
                  {value}
                  {unit}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 일기 보러 가기 / 오늘 일기 쓰러 가기 버튼 */}
        {currentDiary ? (
          <Pressable
            style={styles.moveToDiaryButton}
            onPress={() => setViewMode("diary")}
          >
            <Text style={styles.moveToDiaryText}>일기 보러 가기</Text>
          </Pressable>
        ) : !hasTodayDiary() ? (
          <Pressable
            style={styles.moveToDiaryButton}
            onPress={goToWriteTodayDiary}
          >
            <Text style={styles.moveToDiaryText}>오늘 일기 쓰러 가기</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  // 일기 뷰
  if (viewMode === "diary" && currentDiary) {
    return (
      <View style={styles.container}>
        <Topbar
          title="일기"
          left={
            <Pressable onPress={() => setViewMode("calendar")}>
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </Pressable>
          }
          right={<Blank size={22} />}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* 날짜 네비게이션 */}
          <View style={styles.moveMonthBox}>
            <Pressable onPress={() => navigateDiary("prev")}>
              <Arrow size={14} direction="left" />
            </Pressable>
            <Text style={styles.monthText}>
              {selectedDate?.getFullYear()}.
              {String((selectedDate?.getMonth() ?? 0) + 1).padStart(2, "0")}.
              {String(selectedDate?.getDate()).padStart(2, "0")}
            </Text>
            <Pressable onPress={() => navigateDiary("next")}>
              <Arrow size={14} />
            </Pressable>
          </View>

          {/* 일기 내용 */}
          <View style={styles.diaryContentBox}>
            <Text style={styles.diaryContent}>{currentDiary.content}</Text>
          </View>
        </ScrollView>

        {/* AI 답장 보기 / 일기 보기 버튼 */}
        {currentDiary.aiReply && (
          <Pressable
            style={styles.moveToDiaryButton}
            onPress={() => setViewMode("aiReply")}
          >
            <Text style={styles.moveToDiaryText}>답장 보러 가기</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // AI 답장 뷰
  if (viewMode === "aiReply" && currentDiary?.aiReply) {
    return (
      <View style={styles.container}>
        <Topbar
          title="AI 답장"
          left={
            <Pressable onPress={() => setViewMode("calendar")}>
              <Ionicons name="arrow-back" size={24} color={colors.black} />
            </Pressable>
          }
          right={<Blank size={22} />}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* 날짜 네비게이션 */}
          <View style={styles.moveMonthBox}>
            <Pressable onPress={() => navigateDiary("prev")}>
              <Arrow size={14} direction="left" />
            </Pressable>
            <Text style={styles.monthText}>
              {selectedDate?.getFullYear()}.
              {String((selectedDate?.getMonth() ?? 0) + 1).padStart(2, "0")}.
              {String(selectedDate?.getDate()).padStart(2, "0")}
            </Text>
            <Pressable onPress={() => navigateDiary("next")}>
              <Arrow size={14} />
            </Pressable>
          </View>

          {/* AI 답장 내용 */}
          <View style={styles.diaryContentBox}>
            <Text style={styles.diaryContent}>{currentDiary.aiReply}</Text>
          </View>
        </ScrollView>

        {/* 일기 보러 가기 버튼 */}
        <Pressable
          style={styles.moveToDiaryButton}
          onPress={() => setViewMode("diary")}
        >
          <Text style={styles.moveToDiaryText}>일기 보러 가기</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 84,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  moveMonthBox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
  },
  calendarContainer: {
    width: "100%",
    marginBottom: 24,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  weekDayBox: {
    width: "14.28%",
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayBox: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dayBoxSelected: {
    backgroundColor: colors.black,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: colors.black,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: "600",
  },
  diaryIndicator: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4ECDC4",
  },
  monthlyStatsContainer: {
    width: "100%",
    marginBottom: 100,
  },
  monthlyStatsBox: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 24,
    borderBottomColor: "#EDEDED",
  },
  monthlyStatsText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
  },
  diaryContentBox: {
    width: "100%",
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    marginTop: 20,
    minHeight: 200,
  },
  diaryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  moveToDiaryButton: {
    width: 240,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: colors.black,
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  moveToDiaryText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 18,
  },
});

export default Calendar;

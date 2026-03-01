import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";

type ViewMode = "writing" | "saved" | "aiReply";

function Diary() {
  const navigation = useNavigation();
  const route = useRoute();
  const { date } = (route.params as { date?: string }) ?? {};

  // Parse the date string into parts for navigation
  const parseDateParts = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return { year: y, month: m, day: d };
  };

  const initialParts = date
    ? parseDateParts(date)
    : { year: 2025, month: 8, day: 3 };

  const [currentYear, setCurrentYear] = useState(initialParts.year);
  const [currentMonth, setCurrentMonth] = useState(initialParts.month);
  const [currentDay, setCurrentDay] = useState(initialParts.day);

  const [viewMode, setViewMode] = useState<ViewMode>("writing");
  const [diaryText, setDiaryText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [aiReplyText] = useState(
    "오늘 하루도 수고 많았어요! 작은 일이라도 해낸 자신을 칭찬해 주세요. 내일은 더 좋은 하루가 될 거예요. 항상 응원하고 있어요!"
  );

  const formatDate = () => {
    const m = String(currentMonth).padStart(2, "0");
    const d = String(currentDay).padStart(2, "0");
    return `${currentYear}.${m}.${d}`;
  };

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month, 0).getDate();

  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      const prevDay = currentDay - 1;
      if (prevDay < 1) {
        const prevMonth = currentMonth - 1;
        if (prevMonth < 1) {
          const prevYear = currentYear - 1;
          setCurrentYear(prevYear);
          setCurrentMonth(12);
          setCurrentDay(getDaysInMonth(prevYear, 12));
        } else {
          setCurrentMonth(prevMonth);
          setCurrentDay(getDaysInMonth(currentYear, prevMonth));
        }
      } else {
        setCurrentDay(prevDay);
      }
    } else {
      const maxDay = getDaysInMonth(currentYear, currentMonth);
      const nextDay = currentDay + 1;
      if (nextDay > maxDay) {
        const nextMonth = currentMonth + 1;
        if (nextMonth > 12) {
          setCurrentYear(currentYear + 1);
          setCurrentMonth(1);
          setCurrentDay(1);
        } else {
          setCurrentMonth(nextMonth);
          setCurrentDay(1);
        }
      } else {
        setCurrentDay(nextDay);
      }
    }
  };

  // Check if there is a next date (for graying out forward arrow)
  const today = new Date();
  const currentDateObj = new Date(currentYear, currentMonth - 1, currentDay);
  const hasNext = currentDateObj < today;

  const handleSave = () => {
    if (diaryText.trim().length === 0) return;
    setSavedText(diaryText);
    setViewMode("saved");
  };

  const handleGoToAiReply = () => {
    setViewMode("aiReply");
  };

  const handleGoToDiary = () => {
    setViewMode("saved");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Horizontal lines for the notebook
  const NOTEBOOK_LINE_COUNT = 16;
  const notebookLines = Array.from({ length: NOTEBOOK_LINE_COUNT });

  // Writing mode
  if (viewMode === "writing") {
    return (
      <View style={styles.container}>
        <Topbar
          title="일기"
          left={
            <MaterialIcons
              name="arrow-back-ios-new"
              size={22}
              color={colors.black}
            />
          }
          onLeftPress={handleBack}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Date navigation */}
          <View style={styles.dateNav}>
            <Pressable onPress={() => navigateDate("prev")}>
              <MaterialIcons
                name="arrow-back-ios-new"
                size={14}
                color={colors.black}
              />
            </Pressable>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Pressable
              onPress={() => hasNext && navigateDate("next")}
              disabled={!hasNext}
            >
              <MaterialIcons
                name="arrow-forward-ios"
                size={14}
                color={hasNext ? colors.black : colors.gray200}
              />
            </Pressable>
          </View>

          {/* Notebook area */}
          <View style={styles.notebook}>
            {/* Horizontal lines */}
            {notebookLines.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.notebookLine,
                  { top: 30 * (i + 1) },
                ]}
              />
            ))}
            <TextInput
              style={styles.notebookInput}
              placeholder="일기를 작성해 주세요..."
              placeholderTextColor={colors.gray300}
              multiline
              value={diaryText}
              onChangeText={setDiaryText}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Save button */}
        <Pressable style={styles.bottomButton} onPress={handleSave}>
          <Text style={styles.bottomButtonText}>저장하기</Text>
        </Pressable>
      </View>
    );
  }

  // Saved diary view (after writing)
  if (viewMode === "saved") {
    return (
      <View style={styles.container}>
        <Topbar
          title="일기"
          left={
            <MaterialIcons
              name="arrow-back-ios-new"
              size={22}
              color={colors.black}
            />
          }
          onLeftPress={handleBack}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Date navigation */}
          <View style={styles.dateNav}>
            <Pressable onPress={() => navigateDate("prev")}>
              <MaterialIcons
                name="arrow-back-ios-new"
                size={14}
                color={colors.black}
              />
            </Pressable>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Pressable
              onPress={() => hasNext && navigateDate("next")}
              disabled={!hasNext}
            >
              <MaterialIcons
                name="arrow-forward-ios"
                size={14}
                color={hasNext ? colors.black : colors.gray200}
              />
            </Pressable>
          </View>

          {/* Notebook area (read-only) */}
          <View style={styles.notebook}>
            {notebookLines.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.notebookLine,
                  { top: 30 * (i + 1) },
                ]}
              />
            ))}
            <Text style={styles.notebookText}>{savedText}</Text>
          </View>
        </ScrollView>

        {/* Show AI reply button if reply exists */}
        {aiReplyText && (
          <Pressable style={styles.bottomButton} onPress={handleGoToAiReply}>
            <Text style={styles.bottomButtonText}>답장 보러 가기</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // AI Reply view
  if (viewMode === "aiReply") {
    return (
      <View style={styles.container}>
        <Topbar
          title="일기"
          left={
            <MaterialIcons
              name="arrow-back-ios-new"
              size={22}
              color={colors.black}
            />
          }
          onLeftPress={handleBack}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Date navigation */}
          <View style={styles.dateNav}>
            <Pressable onPress={() => navigateDate("prev")}>
              <MaterialIcons
                name="arrow-back-ios-new"
                size={14}
                color={colors.black}
              />
            </Pressable>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Pressable
              onPress={() => hasNext && navigateDate("next")}
              disabled={!hasNext}
            >
              <MaterialIcons
                name="arrow-forward-ios"
                size={14}
                color={hasNext ? colors.black : colors.gray200}
              />
            </Pressable>
          </View>

          {/* Notebook area with AI reply */}
          <View style={styles.notebook}>
            {notebookLines.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.notebookLine,
                  { top: 30 * (i + 1) },
                ]}
              />
            ))}
            <Text style={styles.notebookText}>{aiReplyText}</Text>
          </View>
        </ScrollView>

        {/* Go back to diary button */}
        <Pressable style={styles.bottomButton} onPress={handleGoToDiary}>
          <Text style={styles.bottomButtonText}>일기 보러 가기</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const NOTEBOOK_WIDTH = 302;
const NOTEBOOK_HEIGHT = 480;
const LINE_WIDTH = 258;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  dateNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  dateText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: colors.black,
  },
  notebook: {
    width: NOTEBOOK_WIDTH,
    height: NOTEBOOK_HEIGHT,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: (NOTEBOOK_WIDTH - LINE_WIDTH) / 2,
    paddingTop: 14,
    position: "relative",
    overflow: "hidden",
  },
  notebookLine: {
    position: "absolute",
    left: (NOTEBOOK_WIDTH - LINE_WIDTH) / 2,
    width: LINE_WIDTH,
    height: 1,
    backgroundColor: colors.gray200,
  },
  notebookInput: {
    flex: 1,
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 30,
    color: colors.black,
    padding: 0,
    textAlignVertical: "top",
  },
  notebookText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 30,
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

export default Diary;

import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import { getDiary, saveDiary } from "../services/diary";

type ViewMode = "writing" | "saved" | "aiReply";

function Diary() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { date } = (route.params as { date?: string }) ?? {};

  // Parse the date string into parts for navigation
  const parseDateParts = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return { year: y, month: m, day: d };
  };

  const todayNow = new Date();
  const initialParts = date
    ? parseDateParts(date)
    : {
        year: todayNow.getFullYear(),
        month: todayNow.getMonth() + 1,
        day: todayNow.getDate(),
      };

  const [currentYear, setCurrentYear] = useState(initialParts.year);
  const [currentMonth, setCurrentMonth] = useState(initialParts.month);
  const [currentDay, setCurrentDay] = useState(initialParts.day);

  const [viewMode, setViewMode] = useState<ViewMode>("writing");
  const [diaryText, setDiaryText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [aiReplyText, setAiReplyText] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  const buildDateString = useCallback(() => {
    const m = String(currentMonth).padStart(2, "0");
    const d = String(currentDay).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  }, [currentYear, currentMonth, currentDay]);

  const fetchDiary = useCallback(async () => {
    const dateStr = buildDateString();
    try {
      const res = await getDiary(dateStr);
      if (res.success && res.data) {
        const entry = res.data;
        setIsLocked(entry.isLocked);
        setCanEdit(entry.canEdit);

        if (entry.content) {
          setDiaryText(entry.content);
          setSavedText(entry.content);
          if (entry.reply) {
            setAiReplyText(entry.reply.content);
          } else {
            setAiReplyText("");
          }
          setViewMode("saved");
        } else {
          setDiaryText("");
          setSavedText("");
          setAiReplyText("");
          setViewMode("writing");
        }
      }
    } catch (e) {
      console.error("Failed to fetch diary:", e);
    }
  }, [buildDateString]);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

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

  // Check if there is a next date (for graying out forward arrow).
  // Compare at day granularity so today's arrow is disabled.
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const currentStart = new Date(currentYear, currentMonth - 1, currentDay).getTime();
  const hasNext = currentStart < todayStart;

  const handleSave = async () => {
    if (diaryText.trim().length === 0) return;
    const dateStr = buildDateString();
    try {
      const res = await saveDiary(dateStr, diaryText);
      if (res.success) {
        setSavedText(diaryText);
        setViewMode("saved");
      }
    } catch (e) {
      console.error("Failed to save diary:", e);
    }
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.innerContainer, { paddingTop: insets.top + 50 }]}>
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
              maxLength={5000}
              value={diaryText}
              onChangeText={setDiaryText}
              textAlignVertical="top"
              editable={!isLocked && canEdit}
            />
          </View>
        </ScrollView>

        {/* Save button */}
        <Pressable
          style={[
            styles.bottomButton,
            { bottom: 16 },
            (isLocked || !canEdit) && { opacity: 0.4 },
          ]}
          onPress={handleSave}
          disabled={isLocked || !canEdit}
        >
          <Text style={styles.bottomButtonText}>저장하기</Text>
        </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Saved diary view (after writing)
  if (viewMode === "saved") {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 50 }]}>
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
          <Pressable
            style={[styles.bottomButton, { bottom: 16 }]}
            onPress={handleGoToAiReply}
          >
            <Text style={styles.bottomButtonText}>답장 보러 가기</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // AI Reply view
  if (viewMode === "aiReply") {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 50 }]}>
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
        <Pressable
          style={[styles.bottomButton, { bottom: 16 }]}
          onPress={handleGoToDiary}
        >
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
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 100,
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

export default Diary;

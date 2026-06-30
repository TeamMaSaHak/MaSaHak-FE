import React, { useState, useEffect, useRef } from "react";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { ConfirmModal } from "../components/confirm-modal";
import { colors } from "../constants/colors";
import { getUnreadCount } from "../services/notifications";
import { startTimer, stopTimer, pauseTimer, resumeTimer } from "../services/timer";
import {
  startPomodoro,
  stopPomodoro,
  completeCycle,
  getSettings,
  saveSettings,
} from "../services/pomodoro";
import {
  startAppMonitoring,
  stopAppMonitoring,
  loadAppsWithStatus,
  getMonitoringActive,
} from "../services/app-monitor";

type TimerMode = "timer" | "pomodoro";
type PomodoroPhase = "focus" | "break";

function Home() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // Notification badge
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUnreadCount();
        if (res.success && res.data) {
          setUnreadCount(res.data.count);
        }
      } catch {}
    })();
  }, []);

  // Timer mode
  const [mode, setMode] = useState<TimerMode>("timer");
  const [isRunning, setIsRunning] = useState(false);

  // Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Pomodoro settings
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [totalCycles, setTotalCycles] = useState(5);

  // Pomodoro state
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>("focus");
  const [pomodoroSeconds, setPomodoroSeconds] = useState(focusMinutes * 60);

  // API session tracking
  const sessionIdRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pomodoroElapsedRef = useRef(0);
  const focusPhaseElapsedRef = useRef(0);
  const currentPhaseRef = useRef<PomodoroPhase>("focus");

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  // Sync pomodoroSeconds when focusMinutes changes (settings adjustment)
  useEffect(() => {
    if (!isRunning && mode === "pomodoro" && currentPhase === "focus") {
      setPomodoroSeconds(focusMinutes * 60);
    }
  }, [focusMinutes]);

  useEffect(() => {
    if (!isRunning && mode === "pomodoro" && currentPhase === "break") {
      setPomodoroSeconds(breakMinutes * 60);
    }
  }, [breakMinutes]);

  // App monitoring (Android only)
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    (async () => {
      try {
        const active = await getMonitoringActive();
        setIsMonitoring(active);
      } catch {}
    })();
  }, []);

  // Reset confirmation modal
  const [resetModalVisible, setResetModalVisible] = useState(false);

  // Toggle animation
  const toggleAnim = useRef(new Animated.Value(0)).current;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time (HH : MM : SS)
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(2, "0")}`;
  };

  const handleBoardPress = () => {
    navigation.navigate("Todolist");
  };

  // Load saved pomodoro settings on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          setFocusMinutes(res.data.focusTime);
          setBreakMinutes(res.data.breakTime);
          setTotalCycles(res.data.repeatCount);
          setPomodoroSeconds(res.data.focusTime * 60);
        }
      } catch (error) {
        // Graceful degradation: use default settings if API fails
      }
    })();
  }, []);

  // Toggle timer start/pause
  const toggleTimer = () => {
    if (!isRunning) {
      // Starting or resuming
      if (isPaused) {
        // Resuming from pause
        handleResume();
      } else {
        // Fresh start
        handleStart();
      }
    } else {
      // Pausing
      handlePause();
    }
    setIsRunning(!isRunning);
  };

  const handleStart = async () => {
    try {
      if (mode === "timer") {
        const result = await startTimer();
        if (result.success && result.data) {
          sessionIdRef.current = result.data.sessionId;
        }
      } else {
        // Save settings to server before starting
        try {
          await saveSettings({
            focusTime: focusMinutes,
            breakTime: breakMinutes,
            repeatCount: totalCycles,
          });
        } catch {}

        const result = await startPomodoro({
          focusTime: focusMinutes,
          breakTime: breakMinutes,
          repeatCount: totalCycles,
        });
        if (result.success && result.data) {
          sessionIdRef.current = result.data.sessionId;
        }
        pomodoroElapsedRef.current = 0;
        focusPhaseElapsedRef.current = 0;
      }
    } catch (error) {
      // Graceful degradation: allow local timer to work even if API fails
    }

    if (Platform.OS === "android") {
      try {
        const apps = await loadAppsWithStatus();
        await startAppMonitoring(apps);
        setIsMonitoring(true);
      } catch {}
    }
  };

  const handlePause = async () => {
    setIsPaused(true);
    try {
      if (mode === "timer" && sessionIdRef.current !== null) {
        await pauseTimer(sessionIdRef.current);
      }
    } catch (error) {
      // Graceful degradation
    }
  };

  const handleResume = async () => {
    setIsPaused(false);
    try {
      if (mode === "timer" && sessionIdRef.current !== null) {
        await resumeTimer(sessionIdRef.current);
      }
    } catch (error) {
      // Graceful degradation
    }
  };

  // Reset timer
  const resetTimer = async () => {
    setIsRunning(false);
    setIsPaused(false);

    try {
      if (sessionIdRef.current !== null) {
        if (mode === "timer") {
          await stopTimer(sessionIdRef.current, stopwatchSeconds);
        } else {
          await stopPomodoro(
            sessionIdRef.current,
            pomodoroElapsedRef.current,
            currentCycle
          );
        }
      }
    } catch (error) {
      // Graceful degradation
    }

    sessionIdRef.current = null;
    pomodoroElapsedRef.current = 0;
    focusPhaseElapsedRef.current = 0;

    if (mode === "timer") {
      setStopwatchSeconds(0);
    } else {
      setCurrentCycle(0);
      setCurrentPhase("focus");
      setPomodoroSeconds(focusMinutes * 60);
    }

    if (Platform.OS === "android") {
      try {
        await stopAppMonitoring();
      } catch {}
      setIsMonitoring(false);
    }
  };

  // Switch mode
  const switchMode = async (newMode: TimerMode) => {
    if (mode === newMode) return;
    setIsRunning(false);
    setIsPaused(false);

    // Stop any active session before switching
    try {
      if (sessionIdRef.current !== null) {
        if (mode === "timer") {
          await stopTimer(sessionIdRef.current, stopwatchSeconds);
        } else {
          await stopPomodoro(
            sessionIdRef.current,
            pomodoroElapsedRef.current,
            currentCycle
          );
        }
      }
    } catch (error) {
      // Graceful degradation
    }

    sessionIdRef.current = null;
    pomodoroElapsedRef.current = 0;
    focusPhaseElapsedRef.current = 0;

    if (Platform.OS === "android") {
      try {
        await stopAppMonitoring();
      } catch {}
      setIsMonitoring(false);
    }

    Animated.timing(toggleAnim, {
      toValue: newMode === "pomodoro" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (newMode === "pomodoro") {
      setMode("pomodoro");
      setStopwatchSeconds(0);
      setPomodoroSeconds(focusMinutes * 60);
      setCurrentCycle(0);
      setCurrentPhase("focus");
    } else {
      setMode("timer");
      setStopwatchSeconds(0);
    }
  };

  // Pomodoro next phase
  const nextPomodoroPhase = () => {
    if (currentPhase === "focus") {
      const newCycle = currentCycle + 1;

      // Report cycle completion to API
      if (sessionIdRef.current !== null) {
        try {
          completeCycle(
            sessionIdRef.current,
            newCycle,
            focusPhaseElapsedRef.current
          );
        } catch (error) {
          // Graceful degradation
        }
      }

      focusPhaseElapsedRef.current = 0;
      setCurrentPhase("break");
      setPomodoroSeconds(breakMinutes * 60);
      setCurrentCycle(newCycle);
    } else {
      if (currentCycle >= totalCycles) {
        setIsRunning(false);
        resetTimer();
      } else {
        focusPhaseElapsedRef.current = 0;
        setCurrentPhase("focus");
        setPomodoroSeconds(focusMinutes * 60);
      }
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === "timer") {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          pomodoroElapsedRef.current += 1;
          if (currentPhaseRef.current === "focus") {
            focusPhaseElapsedRef.current += 1;
          }
          setPomodoroSeconds((prev) => {
            if (prev <= 1) {
              nextPomodoroPhase();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  // Toggle circle position interpolation
  const toggleTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });

  // Display time
  const displayTime =
    mode === "timer"
      ? formatTime(stopwatchSeconds)
      : formatTime(pomodoroSeconds);

  return (
    <View style={styles.container}>
      <Topbar
        title="홈"
        left={
          <MaterialIcons name="assignment" size={22} color={colors.black} />
        }
        right={<MaterialIcons name="mail" size={22} color={colors.black} />}
        onLeftPress={handleBoardPress}
        onRightPress={() => navigation.navigate("Notifications")}
        rightBadge={unreadCount}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 50 + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pomodoro cycle indicators */}
        {mode === "pomodoro" && (
          <View style={styles.cycleRow}>
            {Array.from({ length: totalCycles }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.cycleCircle,
                  index < currentCycle && styles.cycleCircleFilled,
                ]}
              />
            ))}
          </View>
        )}

        {/* Timer display */}
        <Text
          style={[styles.timerText, isMonitoring && styles.timerTextWithBadge]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {displayTime}
        </Text>

        {/* Monitoring badge */}
        {isMonitoring && (
          <Text style={styles.monitoringBadge}>비허용 앱 차단 중</Text>
        )}

        {/* Toggle tabs */}
        <View style={styles.toggleContainer}>
          <Pressable onPress={() => switchMode("timer")}>
            <Text
              style={[
                styles.toggleText,
                mode === "timer"
                  ? styles.toggleTextActive
                  : styles.toggleTextInactive,
              ]}
            >
              타이머
            </Text>
          </Pressable>

          <View style={styles.toggleTrack}>
            <Animated.View
              style={[
                styles.toggleCircle,
                { transform: [{ translateX: toggleTranslateX }] },
              ]}
            />
          </View>

          <Pressable onPress={() => switchMode("pomodoro")}>
            <Text
              style={[
                styles.toggleText,
                mode === "pomodoro"
                  ? styles.toggleTextActive
                  : styles.toggleTextInactive,
              ]}
            >
              뽀모도로
            </Text>
          </Pressable>
        </View>

        {/* Character area */}
        <View style={styles.characterArea}>
          <Text style={styles.characterLabel}>캐릭터</Text>
        </View>

        {/* Pomodoro settings */}
        {mode === "pomodoro" && !isRunning && (
          <View style={styles.settingsContainer}>
            <View style={styles.settingsColumn}>
              <Text style={styles.settingsLabel}>집중 시간</Text>
              <View style={styles.settingsValueRow}>
                <Pressable onPress={() => setFocusMinutes(Math.max(5, focusMinutes - 5))}>
                  <Text style={styles.settingsArrow}>∨5</Text>
                </Pressable>
                <Text style={styles.settingsValue}>{focusMinutes}</Text>
                <Pressable onPress={() => setFocusMinutes(Math.min(120, focusMinutes + 5))}>
                  <Text style={styles.settingsArrow}>5∧</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.settingsColumn}>
              <Text style={styles.settingsLabel}>휴식 시간</Text>
              <View style={styles.settingsValueRow}>
                <Pressable onPress={() => setBreakMinutes(Math.max(5, breakMinutes - 1))}>
                  <Text style={styles.settingsArrow}>∨1</Text>
                </Pressable>
                <Text style={styles.settingsValue}>{breakMinutes}</Text>
                <Pressable onPress={() => setBreakMinutes(Math.min(30, breakMinutes + 1))}>
                  <Text style={styles.settingsArrow}>1∧</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.settingsColumn}>
              <Text style={styles.settingsLabel}>반복</Text>
              <View style={styles.settingsValueRow}>
                <Pressable onPress={() => setTotalCycles(Math.max(1, totalCycles - 1))}>
                  <Text style={styles.settingsArrow}>∨1</Text>
                </Pressable>
                <Text style={styles.settingsValue}>{totalCycles}</Text>
                <Pressable onPress={() => setTotalCycles(Math.min(10, totalCycles + 1))}>
                  <Text style={styles.settingsArrow}>1∧</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Phase text when running */}
        {mode === "pomodoro" && isRunning && (
          <Text style={styles.phaseText}>
            {currentPhase === "focus" ? "집중 시간" : "휴식 시간"}
          </Text>
        )}

        {/* Control buttons */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsWrapper}>
            {/* Reset button */}
            <Pressable style={styles.resetButton} onPress={() => setResetModalVisible(true)}>
              <MaterialIcons name="replay" size={32} color={colors.black} />
            </Pressable>

            {/* Play/Pause button */}
            <Pressable style={styles.playButton} onPress={toggleTimer}>
              <MaterialIcons
                name={isRunning ? "pause" : "play-arrow"}
                size={60}
                color={colors.white}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Reset confirmation modal: ConfirmModal places its first text arg on the
          left button and its second on the right — "확인" must sit on the left,
          so it is passed as cancelText/onCancel and "취소" as confirmText/onConfirm */}
      <ConfirmModal
        visible={resetModalVisible}
        title="정말 리셋하시겠습니까?"
        subtitle="리셋 시 공부 시간은 자동으로 저장됩니다."
        cancelText="확인"
        confirmText="취소"
        onCancel={() => {
          setResetModalVisible(false);
          resetTimer();
        }}
        onConfirm={() => setResetModalVisible(false)}
      />
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 24,
  },

  // Toggle
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 40,
  },
  toggleText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 12,
    lineHeight: 10,
  },
  toggleTextActive: {
    color: colors.black,
  },
  toggleTextInactive: {
    color: colors.gray200,
  },
  toggleTrack: {
    width: 46,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 3.5,
    elevation: 2,
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.black,
  },

  // Timer
  timerText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 50,
    lineHeight: 48,
    color: colors.black,
    textAlign: "center",
    marginBottom: 40,
  },
  timerTextWithBadge: {
    marginBottom: 8,
  },
  monitoringBadge: {
    fontFamily: "Pretendard-Regular",
    fontSize: 11,
    lineHeight: 14,
    color: colors.gray300,
    marginBottom: 24,
  },

  // Pomodoro cycles
  cycleRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  cycleCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  cycleCircleFilled: {
    backgroundColor: colors.black,
  },
  phaseText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 12,
    color: colors.gray300,
  },

  // Character
  characterArea: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  characterLabel: {
    fontFamily: "Pretendard-Regular",
    fontSize: 10,
    lineHeight: 12,
    color: colors.gray300,
  },

  // Controls
  controlsContainer: {
    marginTop: "auto",
    paddingVertical: 24,
  },
  controlsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 36,
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  // Pomodoro Settings
  settingsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginBottom: 16,
  },
  settingsColumn: {
    alignItems: "center",
    gap: 8,
  },
  settingsLabel: {
    fontFamily: "Pretendard-Regular",
    fontSize: 10,
    lineHeight: 14,
    color: colors.gray300,
  },
  settingsValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsValue: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
    lineHeight: 20,
    color: colors.black,
    minWidth: 24,
    textAlign: "center",
  },
  settingsArrow: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 12,
    color: colors.gray300,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});

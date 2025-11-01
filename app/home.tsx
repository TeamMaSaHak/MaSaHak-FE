import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { Mail, Board } from "../assets/icons";
import { colors } from "../constants/colors";

type TimerMode = "stopwatch" | "pomodoro";
type PomodoroPhase = "focus" | "break";

function Home() {
  const navigation = useNavigation<any>();

  // 타이머 모드
  const [mode, setMode] = useState<TimerMode>("stopwatch");
  const [isRunning, setIsRunning] = useState(false);

  // 스탑워치 상태
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // 뽀모도로 설정
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [totalCycles, setTotalCycles] = useState(4);

  // 뽀모도로 상태
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>("focus");
  const [pomodoroSeconds, setPomodoroSeconds] = useState(focusMinutes * 60);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 시간 포맷팅 (HH:MM:SS)
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((num) => String(num).padStart(2, "0"))
      .join(":");
  };

  const handleBoardPress = () => {
    navigation.navigate("Todolist");
  };

  // 타이머 시작/일시정지
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // 타이머 리셋
  const resetTimer = () => {
    setIsRunning(false);
    if (mode === "stopwatch") {
      setStopwatchSeconds(0);
    } else {
      setCurrentCycle(0);
      setCurrentPhase("focus");
      setPomodoroSeconds(focusMinutes * 60);
    }
  };

  // 모드 전환
  const switchMode = () => {
    setIsRunning(false);
    if (mode === "stopwatch") {
      setMode("pomodoro");
      setStopwatchSeconds(0);
      setPomodoroSeconds(focusMinutes * 60);
      setCurrentCycle(0);
      setCurrentPhase("focus");
    } else {
      setMode("stopwatch");
      setStopwatchSeconds(0);
    }
  };

  // 뽀모도로 다음 단계로 이동
  const nextPomodoroPhase = () => {
    if (currentPhase === "focus") {
      // 집중 시간 끝 → 휴식 시간
      setCurrentPhase("break");
      setPomodoroSeconds(breakMinutes * 60);
      setCurrentCycle((prev) => prev + 1);
    } else {
      // 휴식 시간 끝 → 다음 집중 시간 또는 종료
      if (currentCycle >= totalCycles) {
        // 모든 사이클 완료
        setIsRunning(false);
        resetTimer();
      } else {
        setCurrentPhase("focus");
        setPomodoroSeconds(focusMinutes * 60);
      }
    }
  };

  // 타이머 로직
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (mode === "stopwatch") {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
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

  // 뽀모도로 설정 조절
  const adjustSetting = (
    type: "focus" | "break" | "cycles",
    direction: "increase" | "decrease"
  ) => {
    const delta = direction === "increase" ? 1 : -1;

    switch (type) {
      case "focus":
        const newFocus = Math.max(1, focusMinutes + delta);
        setFocusMinutes(newFocus);
        if (currentPhase === "focus" && !isRunning) {
          setPomodoroSeconds(newFocus * 60);
        }
        break;
      case "break":
        const newBreak = Math.max(1, breakMinutes + delta);
        setBreakMinutes(newBreak);
        if (currentPhase === "break" && !isRunning) {
          setPomodoroSeconds(newBreak * 60);
        }
        break;
      case "cycles":
        setTotalCycles(Math.max(1, Math.min(10, totalCycles + delta)));
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Topbar
        title="홈"
        left={
          <Pressable onPress={handleBoardPress}>
            <Board />
          </Pressable>
        }
        right={<Mail />}
      />
      <View style={styles.wrapper}>
        <View style={styles.timerBox}>
          {/* 타이머 표시 */}
          <Text style={styles.timerText}>
            {mode === "stopwatch"
              ? formatTime(stopwatchSeconds)
              : formatTime(pomodoroSeconds)}
          </Text>

          {/* 모드 전환 버튼 */}
          <Pressable style={styles.changeButton} onPress={switchMode}>
            <Text style={styles.changeButtonText}>
              {mode === "stopwatch" ? "뽀모도로 교체" : "스탑워치 교체"}
            </Text>
          </Pressable>

          {/* 뽀모도로 설정 */}
          {mode === "pomodoro" && !isRunning && (
            <View style={styles.pomodoroSettings}>
              {/* 집중 시간 */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>집중 시간</Text>
                <View style={styles.settingControls}>
                  <Pressable
                    style={styles.controlButton}
                    onPress={() => adjustSetting("focus", "decrease")}
                  >
                    <Ionicons name="remove" size={20} color={colors.black} />
                  </Pressable>
                  <Text style={styles.settingValue}>{focusMinutes}분</Text>
                  <Pressable
                    style={styles.controlButton}
                    onPress={() => adjustSetting("focus", "increase")}
                  >
                    <Ionicons name="add" size={20} color={colors.black} />
                  </Pressable>
                </View>
              </View>

              {/* 휴식 시간 */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>휴식 시간</Text>
                <View style={styles.settingControls}>
                  <Pressable
                    style={styles.controlButton}
                    onPress={() => adjustSetting("break", "decrease")}
                  >
                    <Ionicons name="remove" size={20} color={colors.black} />
                  </Pressable>
                  <Text style={styles.settingValue}>{breakMinutes}분</Text>
                  <Pressable
                    style={styles.controlButton}
                    onPress={() => adjustSetting("break", "increase")}
                  >
                    <Ionicons name="add" size={20} color={colors.black} />
                  </Pressable>
                </View>
              </View>

              {/* 반복 횟수 */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>반복 횟수</Text>
                <View style={styles.settingControls}>
                  <Pressable
                    style={styles.controlButton}
                    onPress={() => adjustSetting("cycles", "decrease")}
                  >
                    <Ionicons name="remove" size={20} color={colors.black} />
                  </Pressable>
                  <Text style={styles.settingValue}>{totalCycles}회</Text>
                  <Pressable
                    style={styles.controlButton}
                    onPress={() => adjustSetting("cycles", "increase")}
                  >
                    <Ionicons name="add" size={20} color={colors.black} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* 뽀모도로 사이클 인디케이터 */}
          {mode === "pomodoro" && (
            <View style={styles.cycleIndicator}>
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
        </View>

        {/* 일러스트 영역 */}
        <View style={styles.timerImage} />

        {/* 컨트롤 버튼 */}
        <View style={styles.controls}>
          <Pressable
            style={[styles.controlButtonLarge, styles.playButton]}
            onPress={toggleTimer}
          >
            <Ionicons
              name={isRunning ? "pause" : "play"}
              size={32}
              color={colors.white}
            />
          </Pressable>

          <Pressable
            style={[styles.controlButtonLarge, styles.resetButton]}
            onPress={resetTimer}
          >
            <Ionicons name="refresh" size={32} color={colors.black} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    padding: 24,
    backgroundColor: colors.white,
  },
  wrapper: {
    flex: 1,
    paddingTop: 60,
    gap: 40,
    alignItems: "center",
  },
  timerBox: {
    alignItems: "center",
    gap: 20,
  },
  timerText: {
    fontSize: 50,
    fontWeight: "600",
    color: colors.black,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: colors.black,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  pomodoroSettings: {
    width: "100%",
    gap: 16,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.black,
  },
  settingControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    minWidth: 50,
    textAlign: "center",
  },
  cycleIndicator: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  cycleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  cycleCircleFilled: {
    backgroundColor: colors.black,
  },
  timerImage: {
    width: 220,
    height: 220,
    backgroundColor: "#F0F0F0",
    borderRadius: 110,
  },
  controls: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  controlButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  playButton: {
    backgroundColor: colors.black,
  },
  resetButton: {
    backgroundColor: "#F5F5F5",
  },
});

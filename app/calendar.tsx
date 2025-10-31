import { StyleSheet, View, Text, Pressable } from "react-native";
import { Arrow, Blank, Mail } from "../assets/icons";
import { Topbar } from "../components/topbar";

function Calendar() {
  const monthlyStatsMeta = [
    { title: "이번 달 집중 횟수", unit: "회" },
    { title: "이번 달 집중 시간", unit: "분" },
    { title: "이번 달 집중한 날", unit: "회" },
    { title: "완료한 투두리스트 수", unit: "개" },
    { title: "평균 집중 시간", unit: "분" },
  ];
  return (
    <View style={styles.container}>
      <Topbar
        title="캘린더"
        left={<Blank size={22} />}
        right={<Mail size={22} />}
      />
      <View style={styles.moveMonthBox}>
        <Arrow size={14} direction="left" />
        <Text style={styles.monthText}>2024.09</Text>
        <Arrow size={14} />
      </View>
      <View style={styles.monthlyStatsContainer}>
        {monthlyStatsMeta.map(({ title, unit }, i) => (
          <View
            style={[
              styles.monthlyStatsBox,
              { borderBottomWidth: i == monthlyStatsMeta.length - 1 ? 0 : 1 },
            ]}
          >
            <Text style={styles.monthlyStatsText}>{title}</Text>
            <Text style={styles.monthlyStatsText}>{unit}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.moveToDiaryButton}>
        <Text style={styles.moveToDiaryText}>일기 보러 가기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 84,
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 14,
    alignItems: "center",
    backgroundColor: "white",
  },
  moveMonthBox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 600,
  },
  calendarContainer: {
    height: 310,
    width: "100%",
  },
  dayBox: {},
  monthlyStatsContainer: {
    width: "100%",
  },
  monthlyStatsBox: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 24,
    borderBottomColor: "#ededed",
  },
  monthlyStatsText: {
    fontSize: 12,
    fontWeight: 400,
  },
  moveToDiaryButton: {
    width: 240,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "black",
    position: "absolute",
    bottom: 80,
  },
  moveToDiaryText: {
    color: "white",
    fontWeight: 600,
    fontSize: 20,
  },
});
export default Calendar;

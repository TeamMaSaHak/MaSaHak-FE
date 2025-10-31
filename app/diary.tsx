import { StyleSheet, View, Text, Pressable } from "react-native";
import { Arrow, Blank, Mail } from "../assets/icons";
import { Topbar } from "../components/topbar";

function Diary() {
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
export default Diary;

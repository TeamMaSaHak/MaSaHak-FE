import { StyleSheet, View, Text, Pressable } from "react-native";
import { Topbar } from "../components/topbar";
import { Mail, Board } from "../assets/icons";
import { colors } from "../constants/colors";

function Home() {
  return (
    <View style={styles.container}>
      <Topbar title="홈" left={<Board />} right={<Mail />} />
      <View style={styles.wrapper}>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>00:00:00</Text>
          <Pressable style={styles.changeButton}>
            <Text style={styles.changeButtonText}>뽀모도로 교체</Text>
          </Pressable>
        </View>
        <View style={styles.timerImage} />
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
  },
  wrapper: {
    flex: 1,
    paddingTop: 60,
    gap: 60,
    alignItems: "center",
  },
  timerBox: {
    alignItems: "center",
    gap: 40,
  },
  timerText: {
    fontSize: 50,
    fontWeight: 600,
  },
  changeButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: colors.black,
  },
  changeButtonText: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.white,
  },
  timerImage: {
    width: 220,
    height: 220,
    backgroundColor: colors.black,
  },
});

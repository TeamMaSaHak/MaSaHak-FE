import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../constants/colors";

function Onboarding() {
  return (
    <View style={styles.layout}>
      <Text style={styles.welcome}>
        마법사관학교에{"\n"}오신 것을{"\n"}환영합니다.
      </Text>
      <View style={styles.buttonBox}>
        <Pressable style={styles.button}>
          <View style={styles.icon} />
          <Text style={styles.buttonText}>디스코드로 로그인</Text>
        </Pressable>
        <Pressable style={styles.button}>
          <View style={styles.icon} />
          <Text style={styles.buttonText}>애플로 로그인</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default Onboarding;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 150,
    paddingBottom: 100,
    justifyContent: "space-between",
  },
  welcome: {
    fontSize: 36,
    lineHeight: 48,
    fontWeight: 600,
  },
  buttonBox: {
    gap: 10,
  },
  button: {
    flexDirection: "row",
    borderRadius: 35,
    backgroundColor: colors.black,
    paddingVertical: 12,
    paddingLeft: 32,
    alignItems: "center",
  },
  buttonText: {
    flex: 1,
    textAlign: "center",
    color: colors.white,
    fontWeight: 600,
    fontSize: 20,
  },
  icon: {
    width: 46,
    height: 46,
    backgroundColor: colors.white,
  },
});

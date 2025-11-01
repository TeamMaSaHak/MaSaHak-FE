import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Blank } from "../assets/icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";

function Diary() {
  const navigation = useNavigation();
  const route = useRoute();
  const { date } = route.params as { date: string };
  const [diaryContent, setDiaryContent] = useState("");

  return (
    <View style={styles.container}>
      <Topbar
        title="일기 작성"
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </Pressable>
        }
        right={<Blank size={22} />}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 날짜 표시 */}
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{date}</Text>
        </View>

        {/* 일기 입력란 */}
        <TextInput
          style={styles.diaryInput}
          placeholder="오늘 하루는 어땠나요?"
          placeholderTextColor="#999"
          multiline
          value={diaryContent}
          onChangeText={setDiaryContent}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* 완료 버튼 */}
      <Pressable style={styles.completeButton}>
        <Ionicons name="checkmark" size={28} color={colors.white} />
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
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  dateBox: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
  },
  diaryInput: {
    width: "100%",
    minHeight: 400,
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  completeButton: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: colors.black,
    position: "absolute",
    bottom: 100,
    right: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
export default Diary;

import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";
import React from "react";

interface TopbarProps {
  title?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;
}

export const Topbar = ({ title, left, right }: TopbarProps) => {
  return (
    <View style={styles.layout}>
      {left}
      <Text style={styles.title}>{title}</Text>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  layout: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    lineHeight: 24,
    fontSize: 18,
    fontWeight: "600",
  },
});

import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { colors } from "../constants/colors";

interface TopbarProps {
  title?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export const Topbar = ({
  title,
  left,
  right,
  onLeftPress,
  onRightPress,
}: TopbarProps) => {
  return (
    <View style={styles.layout}>
      <View style={styles.iconSlot}>
        {left && (
          <Pressable onPress={onLeftPress} style={styles.iconArea}>
            {left}
          </Pressable>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.iconSlot}>
        {right && (
          <Pressable onPress={onRightPress} style={styles.iconArea}>
            {right}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  layout: {
    position: "absolute",
    width: 390,
    top: 0,
    left: 0,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 20,
    zIndex: 10,
  },
  iconSlot: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  iconArea: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    lineHeight: 24,
    color: colors.black,
    textAlign: "center",
  },
});

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { colors } from "../constants/colors";

// --- BigButton ---

interface BigButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  leftIcon?: React.ReactElement;
  style?: StyleProp<ViewStyle>;
}

export const BigButton = ({ label, leftIcon, style, ...rest }: BigButtonProps) => {
  return (
    <Pressable style={[styles.bigButton, style]} {...rest}>
      {leftIcon && <View style={styles.bigButtonIconArea}>{leftIcon}</View>}
      <Text style={styles.bigButtonText}>{label}</Text>
    </Pressable>
  );
};

// --- SmallButton ---

type SmallButtonVariant = "primary" | "disabled";

interface SmallButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: SmallButtonVariant;
  style?: StyleProp<ViewStyle>;
}

export const SmallButton = ({
  label,
  variant = "primary",
  style,
  ...rest
}: SmallButtonProps) => {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      style={[
        styles.smallButton,
        {
          backgroundColor: isPrimary ? colors.black : colors.gray100,
        },
        style,
      ]}
      disabled={variant === "disabled"}
      {...rest}
    >
      <Text
        style={[
          styles.smallButtonText,
          {
            color: isPrimary ? colors.white : colors.gray300,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// --- TabChip ---

type TabChipVariant = "active" | "inactive";

interface TabChipProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  count?: number;
  variant?: TabChipVariant;
  style?: StyleProp<ViewStyle>;
}

export const TabChip = ({
  label,
  count,
  variant = "inactive",
  style,
  ...rest
}: TabChipProps) => {
  const isActive = variant === "active";
  return (
    <Pressable
      style={[
        styles.tabChip,
        {
          backgroundColor: isActive ? colors.black : colors.white,
          borderWidth: isActive ? 0 : 1,
          borderColor: isActive ? undefined : colors.gray200,
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.tabChipText,
          {
            color: isActive ? colors.white : colors.black,
          },
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <View
          style={[
            styles.tabChipBadge,
            {
              backgroundColor: isActive ? colors.white : colors.black,
            },
          ]}
        >
          <Text
            style={[
              styles.tabChipBadgeText,
              {
                color: isActive ? colors.black : colors.white,
              },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // BigButton
  bigButton: {
    width: "100%",
    maxWidth: 342,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.black,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  bigButtonIconArea: {
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  bigButtonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    color: colors.white,
  },

  // SmallButton
  smallButton: {
    width: 240,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  smallButtonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
  },

  // TabChip
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  tabChipText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 14,
  },
  tabChipBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tabChipBadgeText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 11,
  },
});

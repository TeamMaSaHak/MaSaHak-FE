import React from "react";
import { StyleSheet, Text, View, Pressable, Modal } from "react-native";
import { colors } from "../constants/colors";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmModal = ({
  visible,
  title,
  subtitle,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
}: ConfirmModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.body}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.dividerHorizontal} />
          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={styles.buttonText}>{cancelText}</Text>
            </Pressable>
            <View style={styles.dividerVertical} />
            <Pressable style={styles.button} onPress={onConfirm}>
              <Text style={styles.buttonText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: 244,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  body: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "Pretendard-Regular",
    fontSize: 16,
    color: colors.black,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Pretendard-Regular",
    fontSize: 8,
    color: colors.gray300,
    textAlign: "center",
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: colors.gray200,
  },
  buttonRow: {
    flexDirection: "row",
    height: 44,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.gray200,
  },
  buttonText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 14,
    color: colors.black,
  },
});

import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";

interface TopbarProps {
    title?: string;
    left?: React.ReactElement;
    right?: React.ReactElement;
    onLeftPress?: () => void;
    onRightPress?: () => void;
    rightBadge?: number;
}

export const Topbar = ({
    title,
    left,
    right,
    onLeftPress,
    onRightPress,
    rightBadge,
}: TopbarProps) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.layout, { paddingTop: insets.top, height: 50 + insets.top }]}>
            <View style={styles.iconSlot}>
                {left && (
                    <Pressable onPress={onLeftPress} hitSlop={11} style={styles.iconArea}>
                        {left}
                    </Pressable>
                )}
            </View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.iconSlot}>
                {right && (
                    <Pressable onPress={onRightPress} hitSlop={11} style={styles.iconArea}>
                        {right}
                        {rightBadge != null && rightBadge > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {rightBadge > 99 ? "99+" : rightBadge}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    layout: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
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
    badge: {
        position: "absolute",
        top: -4,
        right: -8,
        minWidth: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#FF3B30",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 3,
    },
    badgeText: {
        fontFamily: "Pretendard-Bold",
        fontSize: 8,
        color: colors.white,
        lineHeight: 10,
    },
});

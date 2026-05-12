import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    Switch,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import {
    getNotificationSettings,
    updateNotificationSettings,
    getTimezone,
    updateTimezone,
} from "../services/settings";

const TIMEZONE_OPTIONS = [
    { label: "대한민국 (KST)", value: "Asia/Seoul" },
    { label: "미국 동부 (EST)", value: "America/New_York" },
    { label: "일본 (JST)", value: "Asia/Tokyo" },
    { label: "영국 (GMT)", value: "Europe/London" },
    { label: "호주 (AEST)", value: "Australia/Sydney" },
];

function Settings() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [pushEnabled, setPushEnabled] = useState(false);
    const [timezone, setTimezone] = useState("Asia/Seoul");
    const [loading, setLoading] = useState(true);
    const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [notiRes, tzRes] = await Promise.all([
                    getNotificationSettings(),
                    getTimezone(),
                ]);
                if (notiRes.success && notiRes.data) {
                    setPushEnabled(notiRes.data.pushEnabled);
                }
                if (tzRes.success && tzRes.data) {
                    setTimezone(tzRes.data.timezone);
                }
            } catch (e) {
                console.error("설정 조회 실패:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleTogglePush = async (value: boolean) => {
        setPushEnabled(value);
        try {
            await updateNotificationSettings(value);
        } catch (e) {
            setPushEnabled(!value);
            console.error("알림 설정 변경 실패:", e);
        }
    };

    const handleChangeTimezone = async (tz: string) => {
        const prev = timezone;
        setTimezone(tz);
        setShowTimezoneDropdown(false);
        try {
            await updateTimezone(tz);
        } catch (e) {
            setTimezone(prev);
            console.error("타임존 변경 실패:", e);
        }
    };

    const currentTzLabel =
        TIMEZONE_OPTIONS.find((o) => o.value === timezone)?.label || timezone;

    if (loading) {
        return (
            <View style={styles.container}>
                <Topbar
                    title="설정"
                    left={<MaterialIcons name="arrow-back-ios-new" size={22} color={colors.black} />}
                    onLeftPress={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.black} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Topbar
                title="설정"
                left={<MaterialIcons name="arrow-back-ios-new" size={22} color={colors.black} />}
                onLeftPress={() => navigation.goBack()}
            />

            <View style={[styles.content, { paddingTop: insets.top + 74 }]}>
                {/* 알림 설정 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>알림</Text>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>푸시 알림</Text>
                        <Switch
                            value={pushEnabled}
                            onValueChange={handleTogglePush}
                            trackColor={{ false: colors.gray200, true: colors.black }}
                            thumbColor={colors.white}
                        />
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 타임존 설정 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>타임존</Text>
                    <Pressable
                        style={styles.row}
                        onPress={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                    >
                        <Text style={styles.rowLabel}>{currentTzLabel}</Text>
                        <MaterialIcons
                            name={showTimezoneDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={20}
                            color={colors.black}
                        />
                    </Pressable>

                    {showTimezoneDropdown && (
                        <View style={styles.dropdown}>
                            {TIMEZONE_OPTIONS.map((option) => (
                                <Pressable
                                    key={option.value}
                                    style={styles.dropdownItem}
                                    onPress={() => handleChangeTimezone(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownItemText,
                                            option.value === timezone && styles.dropdownItemTextSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {option.value === timezone && (
                                        <MaterialIcons name="check" size={16} color={colors.black} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

export default Settings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    section: {
        paddingVertical: 16,
    },
    sectionTitle: {
        fontFamily: "Pretendard-Bold",
        fontSize: 14,
        lineHeight: 20,
        color: colors.black,
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    rowLabel: {
        fontFamily: "Pretendard-Regular",
        fontSize: 14,
        lineHeight: 20,
        color: colors.black,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
    },
    dropdown: {
        marginTop: 8,
        backgroundColor: colors.gray100,
        borderRadius: 12,
        overflow: "hidden",
    },
    dropdownItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownItemText: {
        fontFamily: "Pretendard-Regular",
        fontSize: 12,
        color: colors.black,
    },
    dropdownItemTextSelected: {
        fontFamily: "Pretendard-Bold",
    },
});

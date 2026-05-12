import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import { getPrivacy } from "../services/terms";

function Privacy() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getPrivacy();
                if (res.success && res.data) {
                    setContent(res.data.content);
                }
            } catch (e) {
                console.error("개인정보 처리방침 조회 실패:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Topbar
                title="개인정보 처리방침"
                left={
                    <MaterialIcons name="arrow-back-ios-new" size={22} color={colors.black} />
                }
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView
                style={[styles.content, { paddingTop: insets.top + 74 }]}
                contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={colors.black} style={{ marginTop: 40 }} />
                ) : (
                    <Text style={styles.sectionContent}>{content}</Text>
                )}
            </ScrollView>
        </View>
    );
}

export default Privacy;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    sectionContent: {
        fontFamily: "Pretendard-Regular",
        fontSize: 12,
        lineHeight: 18,
        color: colors.gray300,
    },
});

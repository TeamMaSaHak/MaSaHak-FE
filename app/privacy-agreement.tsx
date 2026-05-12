import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";
import { getPrivacy } from "../services/terms";

function PrivacyAgreement() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const scrollViewHeight = useRef(0);

  const handleContentSizeChange = (_w: number, h: number) => {
    if (scrollViewHeight.current > 0 && h <= scrollViewHeight.current + 20) {
      setIsScrolledToBottom(true);
    }
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    scrollViewHeight.current = e.nativeEvent.layout.height;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getPrivacy();
        if (res.success && res.data) {
          setContent(res.data.content);
        } else {
          setIsScrolledToBottom(true);
        }
      } catch (e) {
        console.error("개인정보 처리방침 조회 실패:", e);
        setIsScrolledToBottom(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading && content) {
      const timer = setTimeout(() => {
        if (!isScrolledToBottom) {
          setIsScrolledToBottom(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, content]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } =
      event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    const contentFitsScreen = contentSize.height <= layoutMeasurement.height + 20;
    if (isAtBottom || contentFitsScreen) {
      setIsScrolledToBottom(true);
    }
  };

  const handleAgree = () => {
    if (isScrolledToBottom) {
      navigation.navigate("CountrySelect");
    }
  };

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
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.black} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionContent}>{content}</Text>
            <View style={styles.footer}>
              <Text style={styles.footerText}>끝까지 스크롤하면 동의 버튼이 활성화됩니다.</Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { bottom: Math.max(insets.bottom + 16, 24) }]}>
        <Pressable
          style={[
            styles.agreeButton,
            isScrolledToBottom
              ? styles.agreeButtonEnabled
              : styles.agreeButtonDisabled,
          ]}
          onPress={handleAgree}
          disabled={!isScrolledToBottom}
        >
          <Text
            style={[
              styles.agreeButtonText,
              isScrolledToBottom
                ? styles.agreeButtonTextEnabled
                : styles.agreeButtonTextDisabled,
            ]}
          >
            동의
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default PrivacyAgreement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 10,
    color: colors.black,
    marginBottom: 6,
  },
  sectionContent: {
    fontFamily: "Pretendard-Regular",
    fontSize: 12,
    lineHeight: 18,
    color: colors.gray300,
  },
  footer: {
    marginTop: 20,
    marginBottom: 100,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Pretendard-Regular",
    fontSize: 10,
    color: colors.gray300,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  agreeButton: {
    width: 240,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  agreeButtonDisabled: {
    backgroundColor: colors.gray100,
  },
  agreeButtonEnabled: {
    backgroundColor: colors.black,
  },
  agreeButtonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
  },
  agreeButtonTextDisabled: {
    color: colors.gray300,
  },
  agreeButtonTextEnabled: {
    color: colors.white,
  },
});

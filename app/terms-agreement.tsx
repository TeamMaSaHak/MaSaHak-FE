import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { colors } from "../constants/colors";

function TermsAgreement() {
  const navigation = useNavigation<any>();
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } =
      event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtBottom) {
      setIsScrolledToBottom(true);
    }
  };

  const handleAgree = () => {
    if (isScrolledToBottom) {
      navigation.navigate("PrivacyAgreement");
    }
  };

  return (
    <View style={styles.container}>
      <Topbar
        title="이용약관"
        left={
          <MaterialIcons name="arrow-back-ios-new" size={22} color={colors.black} />
        }
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제1조 (목적)</Text>
          <Text style={styles.sectionContent}>
            본 약관은 마사학(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의
            권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제2조 (정의)</Text>
          <Text style={styles.sectionContent}>
            1. "서비스"란 학습 시간 관리 및 일정 관리를 위한 모바일 애플리케이션을
            의미합니다.{"\n\n"}
            2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을
            말합니다.{"\n\n"}
            3. "회원"이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서,
            서비스의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수
            있는 자를 말합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제3조 (약관의 효력 및 변경)</Text>
          <Text style={styles.sectionContent}>
            1. 본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을
            발생합니다.{"\n\n"}
            2. 회사는 필요하다고 인정되는 경우 본 약관을 변경할 수 있으며, 약관을
            변경할 경우에는 적용일자 및 변경사유를 명시하여 공지합니다.{"\n\n"}
            3. 회원이 변경된 약관에 동의하지 않는 경우, 회원은 서비스 이용을
            중단하고 탈퇴할 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제4조 (회원가입)</Text>
          <Text style={styles.sectionContent}>
            1. 회원가입은 이용자가 약관의 내용에 동의하고 회사가 정한 가입 양식에
            따라 회원정보를 기입한 후 회원가입 신청을 하여 회사가 이러한 신청에
            대하여 승낙함으로써 체결됩니다.{"\n\n"}
            2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나
            사후에 이용계약을 해지할 수 있습니다:{"\n"}
            - 가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는
            경우{"\n"}
            - 실명이 아니거나 타인의 명의를 이용한 경우{"\n"}
            - 허위의 정보를 기재하거나 회사가 제시하는 내용을 기재하지 않은 경우
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제5조 (서비스의 제공 및 변경)
          </Text>
          <Text style={styles.sectionContent}>
            1. 회사는 다음과 같은 업무를 수행합니다:{"\n"}
            - 학습 시간 측정 및 기록{"\n"}
            - 일정 관리 및 투두리스트 관리{"\n"}
            - 학습 통계 및 분석 제공{"\n"}
            - 기타 회사가 정하는 업무{"\n\n"}
            2. 회사는 서비스의 내용을 변경할 경우에는 그 사유 및 내용을 이용자에게
            통지합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제6조 (서비스의 중단)</Text>
          <Text style={styles.sectionContent}>
            1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절
            등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수
            있습니다.{"\n\n"}
            2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여
            이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사에 고의
            또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제7조 (면책조항)</Text>
          <Text style={styles.sectionContent}>
            1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할
            수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.{"\n\n"}
            2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을
            지지 않습니다.{"\n\n"}
            3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에
            대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한
            손해에 관하여 책임을 지지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제8조 (분쟁의 해결)</Text>
          <Text style={styles.sectionContent}>
            본 약관에 명시되지 않은 사항은 전기통신사업법, 전자상거래 등에서의
            소비자보호에 관한 법률 등 관계법령 및 상관례에 따릅니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>최종 수정일: 2024년 10월 1일</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
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

export default TermsAgreement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingTop: 74,
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
    fontSize: 10,
    lineHeight: 12,
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
    bottom: 40,
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

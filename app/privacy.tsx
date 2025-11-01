import React from "react";
import { StyleSheet, View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Topbar } from "../components/topbar";
import { Blank } from "../assets/icons";
import { colors } from "../constants/colors";

function Privacy() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Topbar
        title="개인정보 처리방침"
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </Pressable>
        }
        right={<Blank size={22} />}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 개인정보의 처리 목적</Text>
          <Text style={styles.sectionContent}>
            마사학은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.{"\n\n"}
            1) 회원 가입 및 관리{"\n"}
            회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정이용 방지, 각종 고지·통지 목적으로 개인정보를 처리합니다.{"\n\n"}
            2) 재화 또는 서비스 제공{"\n"}
            서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공을 목적으로 개인정보를 처리합니다.{"\n\n"}
            3) 마케팅 및 광고에의 활용{"\n"}
            신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공을 목적으로 개인정보를 처리합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 개인정보의 처리 및 보유기간</Text>
          <Text style={styles.sectionContent}>
            1) 마사학은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.{"\n\n"}
            2) 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:{"\n"}
            - 회원 가입 및 관리: 회원 탈퇴시까지{"\n"}
            - 재화 또는 서비스 제공: 재화·서비스 공급완료 및 요금결제·정산 완료시까지{"\n"}
            - 단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료시까지
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 처리하는 개인정보의 항목</Text>
          <Text style={styles.sectionContent}>
            마사학은 다음의 개인정보 항목을 처리하고 있습니다:{"\n\n"}
            1) 회원 가입 및 관리{"\n"}
            - 필수항목: 이름, 학번, 학년, 기숙사, 비밀번호{"\n"}
            - 선택항목: 프로필 사진{"\n\n"}
            2) 서비스 이용{"\n"}
            - 학습 시간 기록, 일정 정보, 투두리스트 정보{"\n\n"}
            3) 인터넷 서비스 이용과정에서 자동 생성되는 정보{"\n"}
            - IP주소, 쿠키, MAC주소, 서비스 이용기록, 방문기록, 불량 이용기록 등
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 개인정보의 제3자 제공</Text>
          <Text style={styles.sectionContent}>
            마사학은 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 개인정보처리의 위탁</Text>
          <Text style={styles.sectionContent}>
            마사학은 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:{"\n\n"}
            1) 클라우드 서비스 제공{"\n"}
            - 위탁받는 자: AWS(Amazon Web Services){"\n"}
            - 위탁하는 업무의 내용: 서버 호스팅 및 데이터 저장{"\n\n"}
            마사학은 위탁계약 체결시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. 정보주체의 권리·의무 및 행사방법</Text>
          <Text style={styles.sectionContent}>
            정보주체는 마사학에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:{"\n\n"}
            1) 개인정보 열람요구{"\n"}
            2) 오류 등이 있을 경우 정정 요구{"\n"}
            3) 삭제요구{"\n"}
            4) 처리정지 요구{"\n\n"}
            권리 행사는 마사학에 대해 개인정보 보호법 시행규칙 별지 제8호 서식에 따라 서면, 전자우편 등을 통하여 하실 수 있으며, 마사학은 이에 대해 지체없이 조치하겠습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. 개인정보의 파기</Text>
          <Text style={styles.sectionContent}>
            1) 마사학은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.{"\n\n"}
            2) 정보주체로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.{"\n\n"}
            3) 개인정보 파기의 절차 및 방법은 다음과 같습니다:{"\n"}
            - 파기절차: 불필요한 개인정보 및 개인정보파일은 개인정보책임자의 책임 하에 내부방침 절차에 따라 처리합니다.{"\n"}
            - 파기방법: 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. 개인정보 보호책임자</Text>
          <Text style={styles.sectionContent}>
            마사학은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:{"\n\n"}
            개인정보 보호책임자{"\n"}
            - 성명: 마사학 팀{"\n"}
            - 연락처: masahak@example.com{"\n\n"}
            정보주체께서는 마사학의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자로 문의하실 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. 개인정보 처리방침의 변경</Text>
          <Text style={styles.sectionContent}>
            이 개인정보 처리방침은 2024년 10월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>최종 수정일: 2024년 10월 1일</Text>
        </View>
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
    paddingTop: 74,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
  },
  footer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});

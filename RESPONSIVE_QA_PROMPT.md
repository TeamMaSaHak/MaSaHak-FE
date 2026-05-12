# MaSaHak 반응형 + 디자인 QA 프롬프트

아래 내용을 그대로 복사해서 Claude에게 전달하세요.

---

## 프롬프트

```
프로젝트: /Users/yugene/Documents/GitKraken/MaSaHak-FE
Figma: https://www.figma.com/design/pNZ71striZgZRvZKpFcH9s/마사학-완성본?node-id=0-1
브라우저: http://localhost:8082/

이 프로젝트는 React Native + Expo 모바일 앱이야.
Figma 디자인과 현재 구현을 비교하고, 레이아웃/스크롤/위치 문제를 찾아 수정해줘.

아래 체크리스트를 **모든 페이지에 대해** 순서대로 실행해.

---

### 대상 페이지 (15개)

1. splash — 앱 시작 화면
2. onboarding — Discord 로그인
3. terms-agreement — 이용약관 동의
4. privacy-agreement — 개인정보 동의
5. country-select — 국가 선택
6. home — 메인 (타이머, 뽀모도로)
7. calendar — 월간 캘린더
8. diary — 일기 작성/조회
9. todolist — 할일 목록
10. profile — 프로필
11. settings — 설정
12. notifications — 알림 설정
13. allowed-apps — 허용 앱 관리
14. terms — 이용약관 전문
15. privacy — 개인정보 전문

---

### Step 1: Figma 스펙 수집

각 페이지의 Figma 노드를 조회해서 아래 값을 기록해:

- 화면 전체 배경색
- 상단 바(topbar) 높이, 좌우 패딩, 아이콘 크기, 타이틀 폰트
- 본문 영역 좌우 패딩 (보통 20px 또는 24px)
- 각 섹션 간 간격 (gap/margin)
- 카드/컨테이너의 padding, border-radius, 배경색, 그림자
- 버튼 높이, 좌우 패딩, border-radius, 폰트
- 하단 탭 바 높이, 아이콘 크기, 라벨 폰트
- 입력 필드 높이, 테두리색, placeholder 색상
- 각 텍스트의 폰트 크기, weight, 색상 hex, line-height

---

### Step 2: 코드와 1:1 대조

Figma에서 수집한 값을 코드의 StyleSheet과 대조해. 이 형식으로 출력해:

| # | 요소 | 속성 | Figma 값 | 코드 값 | 일치 |
|---|------|------|----------|---------|------|
| 1 | topbar | height | 56px | 56 | ✅ |
| 2 | topbar | paddingHorizontal | 20px | 16 | ❌ |
| 3 | 본문 | paddingHorizontal | 20px | 20 | ✅ |

2px 이상 차이나면 ❌ 표시.

---

### Step 3: 화면별 레이아웃 문제 체크

각 페이지에서 아래 항목을 **전부** 확인해. 해당 없으면 "N/A"로 표시.

#### A. 스크롤 문제

| # | 체크 항목 | 설명 | 확인 방법 |
|---|----------|------|----------|
| A1 | 콘텐츠가 화면보다 짧은데 스크롤됨 | 화면에 다 보이는 내용인데 불필요한 ScrollView로 감쌈 → 바운스/빈 공간 스크롤 발생 | ScrollView 사용 여부 확인. 콘텐츠가 뷰포트 내에 들어오면 View로 충분 |
| A2 | 콘텐츠가 길어질 수 있는데 스크롤 안 됨 | 리스트/폼이 길어질 수 있는데 ScrollView 없음 → 하단 콘텐츠 잘림 | FlatList 또는 ScrollView 감싸져 있는지. 특히 todolist, diary, allowed-apps |
| A3 | 스크롤 시 하단 탭이 가려짐 | 스크롤 영역이 하단 탭 뒤까지 확장 → 마지막 아이템이 탭에 가려서 안 보임 | contentContainerStyle에 paddingBottom이 하단 탭 높이(약 80px) 이상인지 |
| A4 | 스크롤 시 상단 바가 같이 스크롤됨 | 상단 바가 고정이 아니라 콘텐츠와 함께 올라감 | topbar가 ScrollView 바깥에 있는지. 안에 있으면 스크롤 시 사라짐 |
| A5 | 키보드가 올라올 때 입력 필드가 가려짐 | 텍스트 입력 시 키보드에 가려서 뭘 쓰는지 안 보임 | KeyboardAvoidingView 또는 ScrollView의 keyboardShouldPersistTaps 설정 |
| A6 | 모달 내부 콘텐츠가 길 때 | 모달 안 내용이 화면을 넘기면 잘림 | 모달 내부에 ScrollView가 있는지, maxHeight 제한이 있는지 |

#### B. 위치/정렬 문제

| # | 체크 항목 | 설명 | 확인 방법 |
|---|----------|------|----------|
| B1 | 하단 고정 버튼이 콘텐츠에 겹침 | "완료", "저장" 같은 하단 CTA 버튼이 스크롤 콘텐츠 위에 겹쳐서 가림 | position: 'absolute', bottom: 0 사용 시 → 콘텐츠에 paddingBottom 여유 있는지 |
| B2 | 하단 탭 바 위치가 기기마다 다름 | 하단 탭이 (width - 342) / 2로 중앙 정렬 → 화면 너비가 342 이하면 잘림 | useWindowDimensions().width가 342 미만인 기기(iPhone SE: 375px는 OK, 하지만 마진 고려 시 빠듯) |
| B3 | SafeArea 미적용으로 노치/인디케이터에 가림 | 상단 노치나 하단 홈 인디케이터에 콘텐츠가 가림 | SafeAreaView 또는 useSafeAreaInsets() 사용 여부. 특히 splash, onboarding |
| B4 | 절대 위치(absolute) 요소가 다른 요소와 겹침 | 타이머 원형 UI, 플로팅 버튼 등이 다른 콘텐츠와 겹침 | position: 'absolute' 사용하는 요소 전부 확인 → 형제 요소에 여유 공간 있는지 |
| B5 | flex: 1이 예상대로 동작 안 함 | 부모에 flex: 1 없이 자식에 flex: 1 → 높이가 0이 됨 | 루트부터 대상 컴포넌트까지 flex: 1 체인이 연결되어 있는지 |
| B6 | 중앙 정렬이 실제로 안 됨 | justifyContent: 'center' + alignItems: 'center' 설정했는데 좌상단에 붙음 | 부모에 flex: 1 또는 명시적 height가 있는지. 높이 없으면 center가 의미 없음 |

#### C. 기기 크기 대응 문제

| # | 체크 항목 | 설명 | 확인 방법 |
|---|----------|------|----------|
| C1 | 고정 너비가 작은 화면에서 넘침 | width: 342 같은 고정값이 iPhone SE(375px)에서 좌우 패딩 포함 시 넘침 | 고정 width 사용하는 곳 전부 확인 → Dimensions.get('window').width 기반 계산 또는 퍼센트 사용 |
| C2 | 고정 높이가 긴 콘텐츠를 자름 | height: 400 같은 고정값인데 내용이 더 길 수 있음 | 동적 콘텐츠(리스트, 텍스트) 영역에 고정 height 사용 여부 → minHeight 또는 flex로 변경 |
| C3 | 타이머 원형 UI가 화면 비율에 안 맞음 | 원형 타이머가 width/height 고정인데 작은 화면에서 잘리거나 큰 화면에서 작아 보임 | home.tsx의 타이머 원형 크기가 화면 너비 기반으로 계산되는지 |
| C4 | 캘린더 셀이 화면 너비에 맞지 않음 | 7열 캘린더가 고정 너비면 화면에 안 맞음 | 각 셀의 width가 (화면너비 - 좌우패딩) / 7로 계산되는지 |
| C5 | 긴 텍스트가 잘리지 않음 | 할일 제목, 일기 내용 등이 길 때 화면 밖으로 나감 | numberOfLines + ellipsizeMode 사용 여부, 또는 flex-shrink/flex-wrap |
| C6 | 세로 모드 전용인데 가로에서 깨짐 | app.json에 orientation: 'portrait'이지만 태블릿에서 회전 가능 | orientation 설정 확인, 가로 전환 시 레이아웃 동작 |

#### D. 특정 컴포넌트 문제

| # | 체크 항목 | 대상 페이지 | 설명 |
|---|----------|------------|------|
| D1 | 뽀모도로 타이머 텍스트가 원형 밖으로 나감 | home | 시간이 긴 경우(99:59:59) 텍스트가 원 밖으로 삐져나오는지 |
| D2 | 할일 체크박스 터치 영역이 너무 작음 | todolist | 체크박스/터치 영역이 44x44px 이상인지 (Apple HIG 최소 기준) |
| D3 | 캘린더 날짜 선택 시 시각 피드백 | calendar | 선택된 날짜 하이라이트가 Figma와 일치하는지 (색상, 크기, border-radius) |
| D4 | 일기 텍스트 입력 영역 높이 | diary | 텍스트 입력이 multiline이면 자동 확장되는지, 최소/최대 높이 |
| D5 | 국가 리스트 스크롤 | country-select | 국가 목록이 길어서 스크롤 필요 → FlatList 사용되는지, 성능 이슈 없는지 |
| D6 | 허용 앱 토글 상태 | allowed-apps | 토글 on/off 색상이 Figma와 일치하는지, 터치 반응 |
| D7 | 하단 탭 활성 상태 | bottom-tab | 선택된 탭의 아이콘/라벨 색상이 Figma와 일치하는지 |
| D8 | 설정 리스트 구분선 | settings | 구분선(divider) 두께, 색상, 좌우 여백이 Figma와 일치하는지 |

---

### Step 4: 브라우저 검증

http://localhost:8082/ 에서 아래 뷰포트로 확인:

1. **iPhone SE** (375×667) — 최소 화면. 고정 너비 넘침, 탭바 잘림 확인
2. **iPhone 14 Pro** (393×852) — 기준 화면. Figma 디자인 기준
3. **iPhone 14 Pro Max** (430×932) — 큰 화면. 중앙 정렬, 여백 확인

각 뷰포트에서:
- 페이지 로드 직후 스크린샷
- 가로 스크롤바 존재 여부 확인
- 콘텐츠 잘림 확인 (하단 탭에 가리는 부분)
- 텍스트 넘침 확인

---

### Step 5: 이슈 수정

발견된 이슈를 심각도순으로 수정해:

1. **Critical** — 콘텐츠 잘림, 버튼 클릭 불가, 스크롤 불가로 기능 사용 불가
2. **Major** — Figma와 4px 이상 차이, 요소 겹침, 불필요한 스크롤
3. **Minor** — 2px 차이, 미세한 색상 차이

수정 후 반드시:
- 해당 파일 다시 읽어서 변경 확인
- 부모-자식 flex 체인 재확인
- 브라우저에서 재검증

---

### 출력 형식

페이지별로 아래 형식으로 출력해:

## [페이지명] 검증 결과

### Figma 대조표
| # | 요소 | 속성 | Figma | 코드 | 일치 |
|---|------|------|-------|------|------|

### 레이아웃 이슈
| # | 유형 | 설명 | 심각도 | 파일:라인 | 수정 내용 |
|---|------|------|--------|----------|----------|

### 수정 내역
| # | 파일 | Before | After |
|---|------|--------|-------|

---

모든 페이지(15개) 검증 완료 후 최종 요약을 출력해:

### 최종 요약
- 전체 대조표: ✅ N건, ❌ M건
- Critical: N건, Major: M건, Minor: N건
- 수정된 파일 목록
```

# 비허용 앱 차단 오버레이 기능 구현 계획

> 열품타처럼 타이머가 켜진 상태에서 비허용 앱을 열면 화면 위에 차단 오버레이가 뜨는 기능.
> 작성일: 2026-06-12

---

## 1. 개요

### 목표 동작 흐름

```
사용자가 홈에서 타이머 시작
  └─▶ 앱 모니터링 서비스 자동 시작
        └─▶ 비허용 앱 열기 감지 (1초 폴링)
              └─▶ 화면 전체 오버레이 표시
                    └─▶ 사용자가 "마법사관학교로 돌아가기" 버튼 클릭
                          └─▶ 오버레이 제거 + 앱 복귀
타이머 정지/리셋
  └─▶ 앱 모니터링 서비스 자동 정지
```

### 플랫폼 지원 범위

| 플랫폼 | 지원 여부 | 비고 |
|--------|-----------|------|
| Android | ✅ | UsageStatsManager + WindowManager 오버레이 |
| iOS | ❌ | OS 정책상 구현 불가, 안내 메시지 표시 |

---

## 2. 기술 아키텍처

```
home.tsx (타이머 상태)
  ├── isRunning: true  ──▶  startAppMonitoring()  ──▶  AppMonitorService (포그라운드 서비스)
  └── isRunning: false ──▶  stopAppMonitoring()   ──▶  AppMonitorService 종료

AppMonitorService (Android)
  ├── UsageStatsManager로 1초마다 포그라운드 앱 폴링
  ├── 비허용 앱 감지 시 WindowManager로 오버레이 추가
  └── 오버레이에서 버튼 클릭 시 오버레이 제거 + 앱 복귀

allowed-apps.tsx (허용 앱 목록 관리)
  └── AsyncStorage에 허용 패키지 목록 저장 → 서비스에 전달
```

### 연관 파일 목록

| 파일 | 역할 |
|------|------|
| `modules/app-monitor/android/.../AppMonitorService.kt` | 포그라운드 서비스, 폴링, 오버레이 |
| `modules/app-monitor/android/.../AppMonitorModule.kt` | Expo 네이티브 모듈 브릿지 |
| `modules/app-monitor/android/src/main/AndroidManifest.xml` | 권한 선언 |
| `modules/app-monitor/index.ts` | JS ↔ Native 타입 정의 |
| `services/app-monitor.ts` | JS 서비스 레이어 |
| `app/allowed-apps.tsx` | 허용/비허용 앱 관리 UI |
| `app/home.tsx` | 타이머 화면 (연동 필요) |

---

## 3. 현재 구현 상태

### ✅ 완료된 것

- [x] `AppMonitorModule.kt` — `getInstalledApps`, 권한 체크/요청, `startMonitoring`, `stopMonitoring`, `updateBlockedPackages`
- [x] `AppMonitorService.kt` — 포그라운드 서비스, 1초 폴링, 오버레이 표시/제거, 앱 복귀 버튼
- [x] `modules/app-monitor/index.ts` — JS 타입 정의 및 브릿지
- [x] `services/app-monitor.ts` — AsyncStorage 기반 허용 목록 저장/로드
- [x] `app/allowed-apps.tsx` — 권한 요청 화면, 허용/비허용 탭, 검색, 토글, 집중모드 배너
- [x] `AndroidManifest.xml` — `PACKAGE_USAGE_STATS`, `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE` 권한 선언

### ❌ 미구현 / 버그

- [ ] **[버그] 오버레이 버튼 클릭 불가** — `FLAG_NOT_FOCUSABLE` 플래그가 터치 이벤트를 하위 창으로 전달하여 버튼이 눌리지 않음
- [ ] **[연동 누락] 타이머 ↔ 모니터링 미연동** — `home.tsx`에서 타이머 시작/정지 시 모니터링이 자동으로 켜지지 않음
- [ ] **[버그] 모니터링 상태 미복원** — 앱 재시작 시 `AppMonitorService`는 `START_STICKY`로 재시작되지만 JS의 `isMonitoring` 상태는 `false`가 되어 불일치 발생
- [ ] **[누락] 서비스 실행 여부 조회 불가** — JS에서 현재 서비스가 실행 중인지 확인하는 API 없음
- [ ] **[누락] iOS 미지원 처리** — iOS에서 `allowed-apps.tsx`에 접근 시 플랫폼 미지원 안내 없음
- [ ] **[개선] 오버레이에 차단된 앱 이름 미표시** — 어떤 앱이 차단됐는지 표시되지 않음

---

## 4. 구현 체크리스트

### Phase 1 — 핵심 버그 수정 (우선순위 최고)

#### 1-1. 오버레이 터치 이벤트 버그 수정 (`AppMonitorService.kt`)

- [x] `WindowManager.LayoutParams`에서 `FLAG_NOT_FOCUSABLE` 플래그 제거
- [x] `FLAG_LAYOUT_IN_SCREEN`만 유지 (전체 화면 덮기 + 터치 전달 차단)
- [ ] 오버레이가 전체 화면을 덮어 터치를 완전히 차단하는지 확인
- [ ] 버튼 클릭 시 `removeOverlay()` + `bringAppToFront()` 정상 동작 확인

#### 1-2. 모니터링 서비스 실행 상태 조회 API 추가

- [x] `AppMonitorService.kt` companion object에 `@Volatile isActive: Boolean` 플래그 추가
  - `ACTION_START` 처리 시 `isActive = true`, `onDestroy()`에서 `false`
- [x] `AppMonitorModule.kt`에 `isMonitoringActive()` AsyncFunction 추가 (`AppMonitorService.isActive` 반환)
- [x] `modules/app-monitor/index.ts`에 `isMonitoringActive(): Promise<boolean>` 함수 export
- [x] `services/app-monitor.ts`에 `getMonitoringActive()` 래퍼 함수 추가

---

### Phase 2 — 타이머 ↔ 모니터링 연동 (`home.tsx`)

#### 2-1. 서비스 import 및 상태 초기화

- [x] `home.tsx`에 `Platform` 및 `startAppMonitoring`, `stopAppMonitoring`, `loadAppsWithStatus`, `getMonitoringActive` import 추가
- [x] `home.tsx`에 `const [isMonitoring, setIsMonitoring] = useState(false)` 상태 추가
- [x] 마운트 시 `getMonitoringActive()`로 실제 서비스 실행 여부를 확인해 `isMonitoring` 초기화
- [x] `Platform.OS !== "android"` 조건으로 iOS에서 모니터링 로직 전체 스킵

#### 2-2. 타이머 시작 시 모니터링 자동 시작

- [x] `handleStart()` 타이머/뽀모도로 API 호출 완료 후 `loadAppsWithStatus()` → `startAppMonitoring()` → `setIsMonitoring(true)` 추가
- [x] try/catch로 모니터링 실패 시 타이머 동작에 영향 없도록 처리
- [x] 뽀모도로 휴식 phase 전환(`nextPomodoroPhase()`) 시 모니터링 상태 변경 없음 (계속 유지)

#### 2-3. 타이머 정지 시 모니터링 자동 정지

- [x] `resetTimer()` 세션 정리 후 `stopAppMonitoring()` 호출, `setIsMonitoring(false)` 업데이트
- [x] 일시정지(`handlePause()`)는 모니터링 유지 — 변경 없음

#### 2-4. 홈 화면 UI에 모니터링 상태 표시

- [x] `isMonitoring` true 시 타이머 텍스트 아래에 "비허용 앱 차단 중" 배지 텍스트 표시
  - 타이머 `marginBottom`을 40 → 8로 축소하고 배지에 `marginBottom: 24` 적용해 전체 간격 유지
- [x] `isMonitoring` false 시 배지 미표시

---

### Phase 3 — 상태 복원 및 동기화

#### 3-1. `allowed-apps.tsx` 모니터링 상태 복원

- [x] `Platform` import 추가, `getMonitoringActive` import 추가
- [x] 마운트 effect: 권한 체크/앱 로드 완료 후 `getMonitoringActive()`로 `isMonitoring` 초기화
- [x] AppState 포커스 복귀 이벤트에서 `getMonitoringActive()` 재호출해 상태 재동기화

#### 3-2. 모니터링 상태 AsyncStorage 저장

- [x] `services/app-monitor.ts`에 `MONITORING_STATE_KEY = "masahak_monitoring_active"` 상수 추가
- [x] `startAppMonitoring()` 에서 `AsyncStorage.setItem(MONITORING_STATE_KEY, "true")` 저장
- [x] `stopAppMonitoring()` 에서 `AsyncStorage.setItem(MONITORING_STATE_KEY, "false")` 저장
- [x] `getMonitoringActive()`: 네이티브 true → 즉시 true 반환 / 네이티브 false + AsyncStorage "true" → 서비스 사망 판단, AsyncStorage "false"로 정리 후 false 반환

---

### Phase 4 — 오버레이 UX 개선 (`AppMonitorService.kt`)

#### 4-1. 차단된 앱 이름 표시

- [x] `showOverlay(appName: String)` 형태로 시그니처 변경
- [x] `startMonitorLoop()`에서 Handler.post 구조를 분리 — 백그라운드 스레드에서 `getApplicationLabel()`로 앱 이름 조회 후 메인 스레드에 전달
- [x] desc 텍스트: `"'$appName'은(는) 비허용 상태예요.\n마법사관학교로 돌아가 집중하세요."`

#### 4-2. 오버레이 버튼 텍스트 개선

- [x] 버튼 텍스트: "마법사관학교로 돌아가기" → "돌아가기"
- [x] 버튼 아래 힌트 TextView 추가: "타이머를 끄면 모든 앱을 사용할 수 있어요" (12sp, #888888)

#### 4-3. 알림(Notification) 개선

- [x] `resources.getIdentifier("ic_launcher", "mipmap", packageName)`로 앱 아이콘 조회, 없으면 `ic_menu_compass` 폴백
- [x] 알림 탭 시 홈 화면으로 이동 — `getLaunchIntentForPackage` 기존 로직 그대로 유지

---

### Phase 5 — iOS 미지원 처리

#### 5-1. iOS 플랫폼 분기

- [x] `modules/app-monitor/index.ts`: `Platform.OS === "android"` 조건으로 `requireNativeModule` 호출 분기. iOS에서는 `null`로 설정하고 모든 함수에서 `?? Promise.resolve(기본값)` 폴백 반환 → 크래시 방지
- [x] `allowed-apps.tsx`: 모든 훅 실행 후, 기존 권한 화면 분기 앞에 `Platform.OS !== "android"` 조건 추가. iOS 진입 시 "Android 전용 기능" 안내 화면 표시 (아이콘, 설명, 돌아가기 버튼)
- [x] `home.tsx` 모니터링 로직: Phase 2에서 이미 `Platform.OS === "android"` 조건부 처리 완료

---

### Phase 6 — 통합 테스트

> 모든 테스트는 **Android 실기기** 에서 진행. 에뮬레이터는 `UsageStatsManager` 동작이 다를 수 있음.
> 테스트 전 앱을 **클린 빌드** (`eas build` 또는 `npx expo run:android`) 후 설치.

---

#### 6-1. 권한 플로우 테스트

> 목적: 권한이 없는 상태에서 올바른 순서로 요청 화면이 뜨고, 권한 부여 후 자동으로 다음 단계로 넘어가는지 확인.

- [ ] 앱 설치 직후(권한 없음) 설정 → 허용 어플 관리 진입
  - 예상: 사용 정보 접근 권한 요청 화면 표시
  - 확인: 아이콘(bar-chart), 제목, 설명 텍스트, "설정 열기" 버튼 노출
- [ ] "설정 열기" 탭 → Android 설정 앱 열림 → 마법사관학교 권한 허용 → 앱으로 복귀
  - 예상: AppState `active` 이벤트로 권한 재확인 → 오버레이 권한 요청 화면으로 자동 전환
  - 주의: 수동으로 화면을 다시 탭할 필요 없이 **자동** 전환되는지 확인
- [ ] "권한 허용하기" 탭 → 오버레이 권한 허용 → 앱 복귀
  - 예상: 앱 목록 로드 시작 → ActivityIndicator 표시 → 앱 목록 노출
- [ ] 권한 모두 허용 상태에서 재진입 → 권한 화면 없이 바로 앱 목록 표시

---

#### 6-2. 앱 차단 골든 패스 테스트

> 목적: 핵심 기능 전체 흐름이 정상 동작하는지 확인.

**사전 조건**: 권한 모두 허용, 비허용 앱(예: YouTube, Chrome) 1개 이상 설정

- [ ] **홈 화면에서 타이머 시작** (▶ 버튼 탭)
  - 예상: 타이머 숫자 아래 "비허용 앱 차단 중" 텍스트 표시
  - 확인: Android 알림바에 "집중 모드 활성화 — 비허용 앱 차단 중" 알림 노출
- [ ] **비허용 앱(YouTube 등) 열기**
  - 예상: 2초 이내 검은 반투명 오버레이 전체 화면 표시
  - 확인 항목:
    - `🧙 집중 시간!` 제목 노출
    - `'YouTube'은(는) 비허용 상태예요.` 형태로 앱 이름 동적 표시
    - `돌아가기` 버튼 노출
    - `타이머를 끄면 모든 앱을 사용할 수 있어요` 힌트 텍스트 노출
- [ ] **"돌아가기" 버튼 탭**
  - 예상: 오버레이 사라짐 → 마법사관학교 홈 화면으로 복귀
  - 확인: 버튼이 실제로 클릭되는지 (`FLAG_NOT_FOCUSABLE` 버그 수정 검증)
- [ ] **같은 비허용 앱 재진입**
  - 예상: 오버레이 재표시
- [ ] **허용 앱(카카오톡 등) 열기**
  - 예상: 오버레이 미표시, 정상 사용 가능
- [ ] **홈으로 돌아와 타이머 리셋**
  - 예상: "비허용 앱 차단 중" 텍스트 사라짐, 알림 사라짐
  - 확인: 리셋 후 비허용 앱 열어도 오버레이 미표시

---

#### 6-3. 뽀모도로 모드 테스트

> 목적: 뽀모도로 phase 전환 시에도 차단이 유지되는지 확인.

- [ ] 뽀모도로 모드 선택 → 집중 시간 짧게 설정(예: 1분) → 타이머 시작
  - 예상: 모니터링 시작, "비허용 앱 차단 중" 표시
- [ ] 집중 시간 중 비허용 앱 열기 → 오버레이 표시 확인
- [ ] 집중 시간 종료 → 휴식 시간 phase로 자동 전환
  - 예상: 모니터링 서비스는 **계속 실행 중** (정지 안 됨)
- [ ] 휴식 시간 중 비허용 앱 열기 → **오버레이 표시 확인** (열품타 동일 정책)
- [ ] 타이머 리셋 → 모니터링 정지 확인

---

#### 6-4. 상태 복원 테스트

> 목적: 앱 재시작 / 화면 이동 후에도 UI 상태가 실제 서비스 상태와 일치하는지 확인.

- [ ] 타이머 실행 중(모니터링 ON) 홈 → 설정 → 허용 어플 관리 이동
  - 예상: `allowed-apps.tsx`의 "집중 모드 ON" 배너가 ON 상태로 표시
- [ ] 허용 어플 관리에서 모니터링 토글 OFF → 홈으로 복귀
  - 예상: 홈의 "비허용 앱 차단 중" 텍스트가 **사라지지 않음** (홈은 별도 동기화 없음, 허용됨)
  - 주의: 이 케이스는 `allowed-apps.tsx`와 `home.tsx`의 `isMonitoring`이 독립적으로 관리됨 — 의도된 동작
- [ ] 타이머 실행 중 앱을 **강제 종료**(최근 앱 목록에서 스와이프)
  - 재시작 후 예상: `isMonitoring = false` (서비스 사망 감지, AsyncStorage 정리됨)
  - 확인: "비허용 앱 차단 중" 텍스트 미표시, 비허용 앱 열어도 오버레이 미표시
- [ ] 앱 복귀(백그라운드 → 포그라운드) 시 `allowed-apps.tsx` AppState 동기화
  - Android 설정 앱 갔다 돌아오면 모니터링 상태 재확인되는지 확인

---

#### 6-5. 엣지 케이스 테스트

> 목적: 일반적이지 않은 상황에서의 안정성 확인.

- [ ] **타이머 일시정지 중 비허용 앱 진입**
  - 예상: 오버레이 표시 (서비스는 정지 안 됨, 열품타 동일 정책)
- [ ] **비허용 앱이 0개**인 상태에서 타이머 시작
  - 예상: 서비스 정상 시작, 차단 앱 없으므로 오버레이 미표시, 크래시 없음
- [ ] **허용 앱으로 설정된 앱**을 모니터링 중에 **비허용으로 토글** 변경
  - 예상: `syncMonitoringList` 호출 → 이후 해당 앱 열면 오버레이 표시
- [ ] **비허용 앱을 허용으로 토글** 변경 (오버레이 표시 중)
  - 예상: `syncMonitoringList` 호출 → 오버레이 즉시 제거 (`removeOverlayIfAllowed` 동작 확인)
- [ ] **여러 비허용 앱을 빠르게 전환** (A → B → A 순서)
  - 예상: 각 앱마다 오버레이가 올바른 앱 이름으로 갱신됨, 중복 오버레이 없음
- [ ] 오버레이 표시 중 **전원 버튼으로 화면 꺼짐 후 재점등**
  - 예상: 오버레이 재표시 또는 정상 제거 (크래시 없음)

---

#### 6-6. iOS 테스트

> 목적: iOS에서 앱 크래시 없이 안내 화면이 표시되는지 확인.

- [ ] iOS 기기(또는 시뮬레이터)에서 앱 실행 → 크래시 없이 정상 시작
- [ ] 설정 → 허용 어플 관리 진입
  - 예상: "Android 전용 기능" 안내 화면 표시 (phone-android 아이콘, 설명 텍스트, 돌아가기 버튼)
- [ ] "돌아가기" 버튼 탭 → 이전 화면으로 정상 복귀
- [ ] 홈 화면 타이머 시작/리셋
  - 예상: 모니터링 관련 에러 없음, 타이머 정상 동작

---

## 5. 구현 순서 권장

```
Phase 1 (버그 수정)
  ↓
Phase 2 (타이머 연동) — 핵심 기능
  ↓
Phase 3 (상태 복원)
  ↓
Phase 5 (iOS 처리)
  ↓
Phase 4 (UX 개선) — 선택
  ↓
Phase 6 (테스트)
```

---

## 6. 주요 기술 제약

1. **UsageStatsManager 정확도**: 1초 폴링이므로 앱 전환 후 최대 1초 지연 발생. 이는 OS 정책상 허용 범위.
2. **Android 14+ 포그라운드 서비스 타입**: `foregroundServiceType="specialUse"` 선언 필수 → 이미 `AndroidManifest.xml`에 적용됨.
3. **FLAG_NOT_FOCUSABLE 동작**: 이 플래그가 있으면 터치 이벤트가 하위 창으로 전달되어 오버레이 버튼이 작동하지 않음 → Phase 1에서 반드시 수정.
4. **iOS에서 `requireNativeModule("AppMonitor")` 크래시**: iOS 빌드 시 네이티브 모듈 미존재로 앱 크래시 가능. Platform.OS 체크 또는 try/catch 필수.

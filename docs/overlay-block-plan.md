# 비허용 앱 차단 오버레이 기능 계획서

> 열품타처럼, 타이머가 켜진 집중 세션 중 비허용 앱을 열면 전체화면 차단 오버레이를 표시하는 기능

---

## 1. 기능 개요

### 목표 동작 흐름

```
[홈] 타이머/뽀모도로 시작
        │
        ▼
 앱 모니터링 자동 시작
 (비허용 앱 목록 로드 → AppMonitorService 실행)
        │
        ▼
 사용자가 비허용 앱 진입
        │
        ▼
 AppMonitorService가 1초 주기로 감지
        │
        ▼
 시스템 오버레이 전체화면 표시
 (🧙 집중 시간! / 돌아가기 버튼)
        │
        ├─── "마법사관학교로 돌아가기" 버튼 클릭
        │           └─→ 오버레이 제거 + 앱 복귀
        │
        └─── 사용자가 직접 앱 전환 (홈 화면 등)
                    └─→ 포그라운드 앱이 비허용이 아니면 오버레이 자동 제거
```

### 열품타와의 비교

| 기능 | 열품타 | 마법사관학교 (현재) | 마법사관학교 (목표) |
|------|--------|------------------|------------------|
| 타이머 시작 시 자동 차단 | ✅ | ❌ (수동 토글) | ✅ |
| 비허용 앱 감지 | ✅ | ✅ | ✅ |
| 시스템 오버레이 표시 | ✅ | ✅ | ✅ (디자인 개선) |
| 뽀모도로 휴식 중 차단 중단 | ✅ | ❌ | ✅ |
| 차단 횟수 통계 | ✅ | ❌ | 추후 구현 |

---

## 2. 현재 구현 현황 분석

### 이미 구현된 것들

```
modules/app-monitor/
  ├── AppMonitorModule.kt       ✅ 권한 확인/요청, 앱 목록, 모니터링 제어
  ├── AppMonitorService.kt      ✅ 포그라운드 서비스, 1초 감지 루프, 오버레이 표시
  └── index.ts                  ✅ TypeScript 인터페이스

services/app-monitor.ts         ✅ loadAppsWithStatus, startAppMonitoring 등

app/allowed-apps.tsx            ✅ 앱 허용/비허용 관리, 수동 모니터링 토글
app/home.tsx                    ✅ 타이머/뽀모도로 UI
```

### 핵심 미구현 사항 (이것이 이번 작업의 핵심)

1. **타이머 ↔ 모니터링 자동 연동 없음**
   - `home.tsx`의 `handleStart()` / `resetTimer()` 에서 `startAppMonitoring()` / `stopAppMonitoring()` 을 호출하지 않음
   - 사용자가 `allowed-apps.tsx`에서 수동으로 집중 모드를 켜야 함

2. **뽀모도로 휴식 시간 중 모니터링 처리 없음**
   - 집중 → 휴식 전환 시 모니터링을 일시 중지해야 함
   - 휴식 → 집중 전환 시 모니터링 재개해야 함

3. **오버레이 UI가 디자인 시스템과 불일치**
   - `AppMonitorService.kt`의 오버레이가 기본 Android View로 구성됨
   - Pretendard 폰트 미적용, 마법사관학교 브랜딩 미반영

4. **권한 없을 때 타이머 시작 처리 없음**
   - `PACKAGE_USAGE_STATS`, `SYSTEM_ALERT_WINDOW` 권한이 없으면 차단이 작동하지 않지만 사용자에게 알려주지 않음

5. **허용 앱 목록이 비어있을 때 처리 없음**
   - 비허용 앱을 하나도 지정하지 않은 상태로 타이머를 켜도 모니터링이 빈 목록으로 시작됨

---

## 3. 기술적 구현 방향

### Android 전용 기능 (iOS 불가)

이 기능은 **Android 전용**이다. iOS는 다음 이유로 구현 불가:
- `UsageStatsManager` (포그라운드 앱 감지) → Android 전용 API
- `SYSTEM_ALERT_WINDOW` (다른 앱 위 오버레이) → Android 전용 권한
- iOS는 앱 간 전환을 감지하거나 다른 앱 위에 UI를 올릴 수 없음

### 상태 관리 방식

타이머 isRunning 상태를 `AppMonitorService`에 전달하는 방법:
- React의 `isRunning` / `currentPhase` 상태 변화 → `services/app-monitor.ts` 함수 호출 → Native Module → Service Intent

```
home.tsx (isRunning 상태)
    │ 변화 감지 (useEffect)
    ▼
services/app-monitor.ts
    │ startAppMonitoring() / stopAppMonitoring()
    ▼
AppMonitorModule.kt
    │ startForegroundService() / stopService()
    ▼
AppMonitorService.kt
    │ 1초 루프 → 오버레이 표시/제거
```

### 뽀모도로 휴식 시간 처리

두 가지 옵션 중 **옵션 A** 채택 (열품타 방식):

- **옵션 A**: 휴식 시간에는 차단 중단 (모니터링 유지하되 차단 안 함)
  - `ACTION_PAUSE_BLOCK` / `ACTION_RESUME_BLOCK` Intent 추가
  - Service 내부에 `isBlockingEnabled` 플래그 추가
- **옵션 B**: 휴식 시간에도 계속 차단 (단순하지만 사용성 나쁨)

---

## 4. 오버레이 UI 개선 계획

### 현재 오버레이 (AppMonitorService.kt)

```
┌─────────────────────────────────┐
│                                 │
│            🧙                   │  ← 56sp emoji
│          집중 시간!              │  ← 26sp bold 흰색
│  이 앱은 비허용 상태예요.        │  ← 14sp 회색
│  마법사관학교로 돌아가 집중하세요│
│                                 │
│  [마법사관학교로 돌아가기]       │  ← 흰색 둥근 버튼
│                                 │
└─────────────────────────────────┘
배경: #E6000000 (반투명 검정)
```

### 개선 오버레이 (목표)

```
┌─────────────────────────────────┐
│                                 │
│            🧙‍♂️                  │  ← 더 큰 캐릭터 이미지
│         집중 시간이에요!         │  ← Pretendard Bold 28sp
│    지금은 공부에 집중할 시간.    │  ← Pretendard Regular 14sp
│    이 앱은 비허용 앱이에요.      │
│                                 │
│   ⏱ 00 : 23 : 14               │  ← 현재 타이머 시간 표시 (선택)
│                                 │
│  [마법사관학교로 돌아가기]       │  ← 브랜드 버튼 스타일
│                                 │
└─────────────────────────────────┘
배경: rgba(0,0,0,0.92) 또는 테마 컬러
```

> **주의**: 오버레이는 시스템 Window에 직접 그려지므로 React Native 컴포넌트 사용 불가.
> Kotlin의 LayoutInflater + XML 레이아웃으로 구현해야 함. Pretendard 폰트도 assets에서 직접 로드.

---

## 5. 파일별 수정 사항 요약

| 파일 | 작업 내용 |
|------|-----------|
| `app/home.tsx` | 타이머 시작/중지/리셋 시 모니터링 연동, 뽀모도로 페이즈 전환 시 차단 pause/resume |
| `services/app-monitor.ts` | `pauseBlocking()`, `resumeBlocking()` 함수 추가 |
| `modules/app-monitor/index.ts` | `pauseBlocking`, `resumeBlocking` export 추가 |
| `AppMonitorModule.kt` | `pauseBlocking`, `resumeBlocking` AsyncFunction 추가 |
| `AppMonitorService.kt` | `ACTION_PAUSE_BLOCK`, `ACTION_RESUME_BLOCK` 처리, `isBlockingEnabled` 플래그, 오버레이 UI 개선, Pretendard 폰트 로드 |
| `app/allowed-apps.tsx` | 수동 모니터링 토글 제거 또는 비활성화 (타이머 연동으로 대체) |

---

## 6. 단계별 구현 체크리스트

### Phase 1 — 타이머 ↔ 모니터링 자동 연동 (핵심)

> 가장 중요한 단계. 이것만 해도 열품타의 핵심 UX가 구현됨.

- [ ] **1-1** `app/home.tsx` - `handleStart()` 에서 타이머 시작 시 권한 확인
  - `checkUsageStatsPermission()` + `checkOverlayPermission()` 호출
  - 권한 없으면 Alert → `allowed-apps.tsx`로 이동 유도 (네비게이션)
  - 권한 있으면 `startAppMonitoring(apps)` 호출

- [ ] **1-2** `app/home.tsx` - `handleStart()` 에서 허용 앱 목록 로드
  - `AsyncStorage`에서 허용 패키지 목록 읽기 (`masahak_allowed_packages` 키)
  - 비허용 앱이 0개면 경고 Toast/Alert: "비허용 앱을 설정하면 차단 기능이 활성화됩니다"
  - (차단 목록이 비어도 타이머는 정상 작동, 모니터링만 빈 상태로 시작)

- [ ] **1-3** `app/home.tsx` - `resetTimer()` 에서 `stopAppMonitoring()` 호출
  - 타이머 리셋 시 모니터링 서비스 중지

- [ ] **1-4** `app/home.tsx` - 일시정지 시 모니터링 유지
  - `handlePause()` / `handleResume()` 에서는 모니터링을 중지하지 않음
  - 일시정지 중에도 비허용 앱 차단 유지 (열품타 동일 방식)

- [ ] **1-5** `services/app-monitor.ts` - `loadBlockedPackages()` 헬퍼 함수 추가
  - AsyncStorage에서 허용 목록 읽어 비허용(blocked) 패키지 배열 반환

---

### Phase 2 — 뽀모도로 휴식 시간 차단 일시 중지

- [ ] **2-1** `AppMonitorService.kt` - `ACTION_PAUSE_BLOCK`, `ACTION_RESUME_BLOCK` 처리 추가
  - `isBlockingEnabled: Boolean = true` 플래그 추가
  - `ACTION_PAUSE_BLOCK` 수신 시 `isBlockingEnabled = false`, 현재 오버레이 제거
  - `ACTION_RESUME_BLOCK` 수신 시 `isBlockingEnabled = true`
  - 모니터 루프에서 `if (!isBlockingEnabled) continue` 처리

- [ ] **2-2** `AppMonitorModule.kt` - `pauseBlocking()`, `resumeBlocking()` AsyncFunction 추가
  - 각각 `ACTION_PAUSE_BLOCK`, `ACTION_RESUME_BLOCK` Intent 전송

- [ ] **2-3** `modules/app-monitor/index.ts` - `pauseBlocking`, `resumeBlocking` export 추가

- [ ] **2-4** `services/app-monitor.ts` - `pauseBlocking()`, `resumeBlocking()` 함수 추가

- [ ] **2-5** `app/home.tsx` - `nextPomodoroPhase()` 에서 페이즈 전환 시 호출
  - 집중 → 휴식 전환: `pauseBlocking()` 호출
  - 휴식 → 집중 전환: `resumeBlocking()` 호출

---

### Phase 3 — 오버레이 UI 개선

> 기능에는 영향 없음. 브랜딩/UX 개선 작업.

- [ ] **3-1** `AppMonitorService.kt` - 오버레이 XML 레이아웃 분리
  - `modules/app-monitor/android/src/main/res/layout/overlay_block.xml` 생성
  - ConstraintLayout 기반, 배경 / 아이콘 / 제목 / 설명 / 버튼 구조
  - `LayoutInflater.from(this).inflate(R.layout.overlay_block, null)` 사용

- [ ] **3-2** `AppMonitorService.kt` - Pretendard 폰트 적용
  - `assets/fonts/Pretendard-Bold.ttf`, `Pretendard-Regular.ttf` 파일 경로 확인
  - `Typeface.createFromAsset(assets, "fonts/Pretendard-Bold.ttf")` 로 로드
  - 제목/버튼에 Bold, 설명에 Regular 적용

- [ ] **3-3** `AppMonitorService.kt` - 오버레이 텍스트 내용 개선
  - 제목: "집중 시간이에요! 📖"
  - 설명: "이 앱은 비허용 앱이에요.\n마법사관학교로 돌아가 집중하세요."
  - 버튼: "돌아가기"

- [ ] **3-4** `AppMonitorService.kt` - 오버레이 색상 마법사관학교 디자인 시스템 적용
  - 배경: `#EB000000` (92% 불투명 검정)
  - 제목 텍스트: `#FFFFFF`
  - 설명 텍스트: `#AAAAAA`
  - 버튼 배경: `#FFFFFF`, 텍스트: `#000000`
  - 버튼 cornerRadius: `50dp` (pill 형태)

---

### Phase 4 — `allowed-apps.tsx` 수동 토글 정리

- [ ] **4-1** `app/allowed-apps.tsx` - 수동 모니터링 토글 배너 처리 결정
  - **옵션 A**: 완전 제거 (타이머로만 제어)
  - **옵션 B**: 유지하되 "타이머 실행 중일 때 자동 활성화됩니다" 안내 문구 추가
  - 권장: 옵션 B (별도 집중 모드 수동 제어도 유용)

- [ ] **4-2** 수동 토글과 타이머 자동 연동 충돌 처리
  - 타이머가 돌아가는 중에 수동으로 모니터링 OFF 시도하면 경고 Alert 표시
  - "타이머 실행 중에는 집중 모드를 끌 수 없어요. 타이머를 먼저 중지해주세요."

---

### Phase 5 — 엣지 케이스 및 안정성

- [ ] **5-1** 앱 강제 종료 후 재시작 시 모니터링 상태 복원
  - 앱 시작 시 타이머가 실행 중이었는지 확인 (세션 ID가 남아있는지)
  - 현재는 앱 재시작하면 타이머가 리셋됨 → 모니터링도 자동 중지됨 (OK)

- [ ] **5-2** Android 배터리 최적화 예외 처리
  - `AppMonitorService`가 Doze 모드에서 죽지 않도록 `FOREGROUND_SERVICE` 유지 확인
  - 현재 `startForeground()`로 구현되어 있으므로 OK

- [ ] **5-3** 타이머 도중 앱이 백그라운드로 가는 경우
  - `AppMonitorService`는 독립 서비스이므로 앱이 백그라운드여도 계속 작동 (OK)
  - `home.tsx`의 `setInterval`은 앱이 백그라운드로 가면 중단될 수 있음 → 이건 별도 이슈

- [ ] **5-4** 오버레이 표시 중 기기 회전 처리
  - `WindowManager.LayoutParams`에 `FLAG_LAYOUT_IN_SCREEN` 유지 확인 (현재 OK)

- [ ] **5-5** 서비스가 이미 실행 중일 때 `startMonitoring` 중복 호출 처리
  - `AppMonitorService.onStartCommand()`에서 `ACTION_START` 수신 시 기존 루프 있으면 재사용

---

### Phase 6 — iOS 대응 (플랫폼 분기)

> iOS는 시스템 제한으로 인해 앱 감지 및 오버레이가 불가능하므로, 기능 자체를 숨김.

- [ ] **6-1** `app/home.tsx` - 타이머 시작 시 `Platform.OS === 'android'` 분기 추가
  - Android: 모니터링 시작
  - iOS: 모니터링 관련 코드 실행하지 않음 (에러 방지)

- [ ] **6-2** `app/allowed-apps.tsx` - iOS에서는 화면 진입 자체를 막거나 안내 표시
  - "앱 차단 기능은 Android에서만 지원됩니다" 메시지

- [ ] **6-3** `services/app-monitor.ts` - 각 함수에 `Platform.OS !== 'android'` 가드 추가
  - iOS에서 호출하면 no-op 또는 빈 배열 반환

---

## 7. 구현 우선순위

```
[즉시] Phase 1 → Phase 2 → Phase 6
[이후] Phase 3 → Phase 4
[여유] Phase 5
```

Phase 1+2+6만 완료해도 열품타의 핵심 기능이 동작한다.
Phase 3+4는 완성도를 높이는 작업이다.

---

## 8. 테스트 시나리오

### 정상 동작 테스트

| 시나리오 | 예상 결과 |
|----------|-----------|
| 권한 없이 타이머 시작 | Alert → 설정 화면 이동 유도 |
| 권한 있고 비허용 앱 0개인 상태로 타이머 시작 | 안내 Toast, 타이머 정상 시작 |
| 타이머 시작 후 비허용 앱 진입 | 1초 이내 오버레이 표시 |
| 오버레이의 "돌아가기" 버튼 클릭 | 오버레이 제거, 마법사관학교 앱 복귀 |
| 오버레이 표시 중 허용 앱으로 전환 | 오버레이 자동 제거 |
| 타이머 리셋 | 모니터링 서비스 중지, 알림 제거 |
| 뽀모도로 집중 → 휴식 전환 | 오버레이 제거, 비허용 앱 진입 가능 |
| 뽀모도로 휴식 → 집중 전환 | 비허용 앱 차단 재개 |
| 앱 백그라운드 중 비허용 앱 진입 | 오버레이 표시 (서비스 독립 실행) |

---

## 9. 주요 제약사항 및 주의사항

1. **Android 전용**: iOS는 이 기능 구현 불가. 플랫폼 분기 필수.
2. **권한 2개 필수**: `PACKAGE_USAGE_STATS` (앱 사용 정보 접근) + `SYSTEM_ALERT_WINDOW` (다른 앱 위에 표시)
3. **EAS Build 필요**: 네이티브 모듈 수정 후에는 반드시 `eas build` 재실행
4. **오버레이는 React Native 컴포넌트 사용 불가**: 시스템 Window 위에 직접 그려지므로 순수 Android View/XML 사용
5. **Pretendard 폰트**: 오버레이에서 사용하려면 `assets` 폴더에서 Kotlin 코드로 직접 로드
6. **UsageStats 지연**: `queryUsageStats`는 최대 1~2초 지연이 있어 차단이 즉각적이지 않을 수 있음

---

*작성일: 2026-06-12*
*작성자: Claude Code*

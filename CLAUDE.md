# MaSaHak FE (마법사관학교)

React Native + Expo 모바일 앱. 학생 집중/생산성 트래커.

## 자료
- API Base: https://backend-production-83ee.up.railway.app/api
- Swagger: https://backend-production-83ee.up.railway.app/api-docs
- Swagger JSON: https://backend-production-83ee.up.railway.app/api-docs-json
- Health: https://backend-production-83ee.up.railway.app/api/health/db
- Discord Client ID: 1419219230812799076
- Discord Redirect: https://backend-production-83ee.up.railway.app/api/auth/discord/callback
- Notion 명세서: https://www.notion.so/seonghow/API-2bc19e902f3c803e81fec75c1ef7fe2d
- Figma: https://www.figma.com/design/pNZ71striZgZRvZKpFcH9s/마사학-완성본?node-id=0-1

## 기술스택
- React Native 0.81.5 + Expo 54
- TypeScript 5.8.3
- React Navigation v7 (Stack + Bottom Tab)
- Expo Auth Session (Discord OAuth)
- Expo Secure Store (토큰 저장)
- Pretendard 폰트

## 구조
```
app/           # 화면 (14개)
components/    # 공용 컴포넌트 (4개)
services/      # API 서비스 (12개)
context/       # Auth Context
constants/     # API URL, 색상
assets/        # 폰트, 아이콘
```

## 검증 기준
- API 연동: Swagger 스펙과 일치, 에러 처리 포함
- 디자인: Figma 픽셀 단위 일치
- 반응형: 모바일 기준 (React Native)
- 기능: 모든 인터랙션 동작 확인

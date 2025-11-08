# Layout Audit Report (신촌새싹스)

## Issue 1 · 히어로/CTA 계측 누락 (해결)
- **원인**: 홈 히어로·입학 CTA DOM에 `data-testid` 부재.
- **조치**: `src/app/page.tsx:164`, `:404`에 `data-testid` 추가.
- **상태**: `tmp/layout/metrics.json`에서 두 요소 모두 가시성 측정 완료, 스냅샷(`home_hero.png`, `home_cta-section.png`) 정상.

## Issue 2 · /about·/contact 404 (해결)
- **원인**: 마케팅 단일 페이지 구조이지만 상단 네비는 별도 라우트로 연결.
- **조치**: `next.config.ts:5`에 임시 리다이렉트(`/about → /#about`, `/contact → /#visit`).
- **상태**: Playwright 재수행 시 404 로그 미발생, 레이아웃 캡처 `about_*`, `contact_*` 완료.

## Issue 3 · 배지 한글 줄바꿈 (해결)
- **원인**: Badge 컴포넌트가 기본 `uppercase + tracking-wide`를 강제하여 한글이 폭을 확보하지 못함.
- **조치**: `src/components/ui/badge.tsx:7`에서 기본 스타일을 `normal-case + tracking-[0.08em] + whitespace-nowrap`로 재정의, 필요한 영문 배지에만 `uppercase` 옵션 부여.
- **상태**: 히어로 배지·섹션 타이틀 배지가 단줄 유지 (`home_hero.png` 확인).

## Issue 4 · 데스크톱 서브메뉴/네비게이션 가독성 (해결)
- **원인**: 네비게이션 링크가 줄바꿈되며 (*유치원* / *소*) 끊어지고, ‘오늘의 식단’이 상단 메뉴에 뜨면서 기존 사이트 대비 레이아웃이 이탈. 드롭다운으로 이동하는 순간 메뉴가 닫힘.
- **조치**: `src/components/site/site-header.client.tsx:351`에서 상위 네비를 좁은 간격·`flex-nowrap`로 정리하고 ‘오늘의 식단’ 단일 링크를 제거하여 `신촌소식 > 급식게시판` 내부로 편입. 드롭다운 컨테이너를 좌측 정렬·단일 컬럼(`DesktopSubmenu`, `min-w-[200px] w-max max-w-[320px]`)으로 축소하고, hover 이탈 지연(`scheduleCloseMenu`)을 도입.
- **상태**: Playwright 스크립트(`tmp/layout/nav-inspect.mjs`)가 상위 → 하위 항목 hover를 연속 수행하며, `tmp/layout/nav_metrics.json`에서 `whiteSpace: "nowrap"`, `tmp/layout/nav_submenu_metrics.json`에서 패널 폭 160px을 확인. `tmp/layout/nav_after_hover.png`에서도 기존 사이트와 유사한 수직 메뉴 형태 확인 가능.

## 재검증 가이드
1. `npm run dev`
2. `node tmp/layout/audit.mjs`
3. `tmp/layout/metrics.json` → `note` 필드 없음 확인

## 산출물 경로
- 지표/로그: `tmp/layout/metrics.json`, `tmp/layout/nav_metrics.json`, `tmp/layout/dev.log`
- 스크린샷: `tmp/layout/*.png`
- 수정 diff: `tmp/layout/patch-proposal.diff`
- 자동화 스크립트: `tmp/layout/audit.mjs`, `tmp/layout/nav-inspect.mjs`

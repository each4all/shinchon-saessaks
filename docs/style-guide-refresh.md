# 스타일 가이드 (2025 Q1 리프레시)

최근 인사말·교육환경·본원 특색 페이지 개편으로 실제 UI와 기존 가이드 사이에 차이가 생겨, 현 상태를 기준으로 토큰/컴포넌트/타이포를 재정리했습니다. 아래 값이 기본 기준이며, 새 UI를 만들 때 이 표를 우선 참고해 주세요.

## 1. 디자인 토큰 스냅샷

| 카테고리 | 현재 값 / 비고 | 출처 |
| --- | --- | --- |
| 브랜드 컬러 | `--brand-primary #ff6b6b`(코랄), `--brand-secondary #2e6f6c`, `--brand-navy #3e5067`, `--brand-mint #8dd3c7`, `--brand-sunshine #ffd166` | `src/styles/themes/theme-coral.css` (기본 테마) |
| 서페이스 | `--surface #fff7f4`, `--surface-muted #f5f7fb`, `--surface-contrast #fff0e7` | 동일 |
| 라운드 | 기본 `--radius = 0.625rem`, 사이드바/카드 표준 **0.65rem** (임의값) | `sidebarCardClass` 등 |
| 섀도우 | `--shadow-soft = 4px 4px 20px rgba(62,80,103,0.08)` | `globals.css` |
| 보더 | `--border = #e8e8e8` | `globals.css` |
| 폰트 | Body/Heading 모두 `"Kanit", "Noto Sans KR", ...` | `globals.css` |

> ⚠️ 기본 라운드 토큰은 그대로 두되, UI에서는 `0.65rem`을 사이드바·카드 표준으로 사용 중입니다. 새 컴포넌트도 동일 값 적용 권장.

## 2. 레이아웃 & 좌우 여백

| 상황 | 클래스/값 | 설명 |
| --- | --- | --- |
| Hero / 서론 섹션 | `mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:px-12` | 인사말·본원특색 히어로에 사용. 데스크탑 기준 약 80px 좌우 여백. |
| 본문 섹션 | `mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-12` | 대부분 상세 페이지 컨텐츠 컨테이너. 모바일 24px, 데스크탑 48px 좌우 패딩. |
| 사이드바+콘텐츠 그리드 | `grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]` | 좌측 220px 고정 사이드바, 우측 컨텐츠. 좌우 여백은 위 컨테이너에 의해 관리. |
| 풀폭 배경 구분 | `border-b border-[var(--border)] bg-white/85` | 섹션별 배경을 살짝 구분할 때 사용. |

모든 페이지는 기본적으로 위 컨테이너 조합을 따라야 하며, 새로운 섹션을 추가할 때도 `mx-auto max-w-6xl px-6 ...` 패턴을 기본으로 적용해 좌우 여백을 일관되게 유지합니다.

## 3. 공통 컴포넌트 정의

### Sidebar Card
- 위치: `IntroSidebar`, `EnvironmentSidebar`
- 클래스: `sidebarCardClass = "self-start rounded-[0.65rem] border border-[var(--border)] bg-white/90 px-5 py-6 shadow-[var(--shadow-soft)]"`
- 내부 섹션 헤더: `sidebarSectionHeadingClass` (uppercase, `tracking-[0.28em]`, text-xs)
- 링크 상태: `buildSidebarLinkClass(active)` → 활성 시 `bg-[var(--brand-primary)]/12 text-[var(--brand-primary)]`, 비활성 시 네이비 텍스트 + hover 서페이스.
- 사용 파일: `src/components/intro/IntroSidebar.tsx`, `src/components/environment/EnvironmentSidebar.tsx`

### Greeting Tabs
- 위치: `src/app/intro/greeting/page.tsx`
- 컨테이너: `TabsList`에 `rounded-[var(--radius-md)] border bg-white/80 px-3 py-2 shadow`
- 탭: `TabsTrigger` -> `rounded-[var(--radius-md)]`, `min-w-[120px]`, 활성 시 브랜드 컬러 보더 + 민트 배경.
- 메모: pill 스타일 유지, 여백 최소화.

### Info Card (교육 철학/프로그램)
- 위치: `src/app/intro/special/page.tsx`
- 클래스: `rounded-[0.65rem] border border-[var(--brand-primary)]/25 (또는 var(--border)) bg-white/95 p-5~6 shadow-[var(--shadow-soft)]`
- 섹션 라벨: uppercase, `tracking-[0.3em]`, text-xs.
- Badge: `bg-[var(--brand-mint)]/40 text-[var(--brand-primary)]` 사용.

### Greeting Image Panel
- 위치: `renderImageGrid` (`src/app/intro/greeting/page.tsx`)
- 프레임: `rounded-[var(--radius-lg)]` → 투명 이미지 강조.
- 배경: `bg-black/5` (placeholder용), caption은 `px-2 text-sm`.
- 사용 목적: 이사장/원장/교사 섹션 모두 카드 배경 없이 본문과 동일 톤 유지.

## 4. 타이포그래피 & 여백

| 요소 | 클래스/수치 | 비고 |
| --- | --- | --- |
| 섹션 라벨 | `text-xs`, `uppercase`, `tracking-[0.3em]`, `text-muted-foreground` | 사이드바/교육 철학 섹션 일괄 |
| 주요 헤드라인 | `font-heading text-[clamp(2.4rem,4vw,3.2rem)]` | 인사말, 특색 Hero |
| 카드 타이틀 | `text-[clamp(1.8rem,2.4vw,2.2rem)]` 또는 `text-lg` | 페이지 성격에 따라 두 단계 사용 |
| 본문 | `text-sm leading-relaxed text-muted-foreground` | 기본 단락 |
| 강조 리드 | `rounded-md border px-4 py-3 text-sm font-semibold` | 인사말 lead 텍스트 |

Padding 계층:
- 카드 바깥 `p-5`~`p-6`
- 섹션 사이 여백 `space-y-5`
- Grid gap `gap-8` (sidebar+content), `gap-4` (카드 내부).

## 5. 예시 & 참조

| 영역 | 파일 | 비고 |
| --- | --- | --- |
| 유치원 소개 사이드바 | `src/components/intro/IntroSidebar.tsx` | 활성 상태, hover, typography 확인 |
| 교육환경 사이드바 | `src/components/environment/EnvironmentSidebar.tsx` | 동일 컴포넌트 재사용 예 |
| 인사말 탭/이미지 | `src/app/intro/greeting/page.tsx` | TabsTrigger, renderImageGrid 구현 참고 |
| 교육 철학/특색 카드 | `src/app/intro/special/page.tsx` | Info card 레이아웃 샘플 |

## 6. 다음 액션
1. 위 내용 기반으로 Notion/디자인 문서도 업데이트 (가능하면 링크 이 docs 파일로).
2. 새 컴포넌트 추가 시 `sidebarCardClass` 등 공통 util을 import해서 일관 유지.
3. 다크 테마나 다른 팔레트 사용 시 `theme-*.css`에서도 같은 라운드/보더 기준을 맞춰야 함.

> 문서에 포함되지 않은 UI 패턴(예: 버튼, 배너 등)이 변경되면 이 파일에 항목을 추가해주세요.

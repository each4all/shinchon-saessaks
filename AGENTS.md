# AGENT Guide — Shinchon Montessori Website Revamp

## Purpose
- Serve as the entry point for any agent contributing to the 신촌몬테소리유치원 웹사이트 개편 프로젝트.
- Summarize the intent, scope, and implementation decisions recorded in the current specification drafts (버전 1.0, 2025-10-22 기준).
- Define the workflow for updating specs and logging project history.

## Project Snapshot
- **Goal**: Deliver a fully modernized, responsive website that improves usability, strengthens admissions funnels, and enhances parent communication (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:105-187`).
- **Primary sections** (public): 유치원 소개, 교육 프로그램, 입학 안내, 알림마당 (`신촌몬테소리유치원_사이트맵_및_페이지구조.md:5-110`).
- **Secure parent portal**: 반 소식, 학사 일정, 서식 자료실, 1:1 문의, 운영위원회, 회원정보 관리 (`신촌몬테소리유치원_사이트맵_및_페이지구조.md:1145-1178`).
- **Administrator goals**: Streamlined CMS, analytics, automated backups, and compliant document management (`신촌몬테소리유치원_개선안_요약본.md:99-109`, `신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:234-244`).
- **Phase 3 enhancement**: Optional PWA 패키징으로 설치형 경험과 오프라인 대응을 제공 (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:1090-1103`).

## Functional Scope Overview
1. **Public Experience**
   - Storytelling about philosophy, staff, facilities, and programs.
   - Admissions funnel (process, FAQ, tuition, online 상담 및 원서 접수).
   - News center with 공지사항, 가정통신문, 행사, 급식 달력, 갤러리.
2. **Parent Portal (로그인)**
   - 반별 교육활동 게시판 with media uploads and comment controls.
   - 학사 일정 캘린더, 서식 다운로드, 1:1 문의, 운영위원회 자료.
   - 회원정보/자녀 정보 관리 supporting 최대 3명 자녀 기록 (`신촌몬테소리유치원_기능_명세서.md:27-74`, `262-320`).
3. **Shared Modules**
   - 회원 가입/로그인/소셜 로그인, 비밀번호 재설정, 권한 관리.
   - 검색, 파일 업로드, 알림, 통계와 로그 기록.

## Technical Decisions
- **UI Layer**: shadcn/ui + Tailwind 커스터마이징으로 일관된 디자인 시스템 유지 (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:125`, `신촌몬테소리유치원_개선안_요약본.md:71`, `신촌몬테소리유치원_기능_명세서.md:7`).
- **Selected Application Stack**: Next.js(App Router) 풀스택 기능(Server Components, Route Handlers, Server Actions) + NextAuth + Vercel Postgres(Vercel DB). 요구사항 문서가 제시한 Node.js 계열 권장 스택을 서버리스 운영 모델로 구체화해 프런트/백이 타입과 데이터 규약을 공유하도록 합니다 (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:115-125`, `1235-1244`).
- **Server Responsibilities**: Next.js Route Handler와 Server Action으로 회원/자녀/게시판/상담/파일 업로드/알림 흐름을 구성하고 `@vercel/postgres`를 통해 영속 데이터를 관리합니다 (`신촌몬테소리유치원_기능_명세서.md:27-74`, `252-320`).
- **Integrations**: SMS 인증, 이메일 발송, 지도 API, Google Analytics/Hotjar 등을 모듈화하여 적용합니다 (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:1207-1249`).
- **Testing & Compliance**: 접근성·성능·보안·반응형·브라우저 호환 테스트를 출시 필수 조건으로 유지합니다 (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:1200-1250`).

## Iteration Log

### 2025-10-28 — GPT-5 Codex
- 반 소식 승인 워크플로 1차 정리: 교사 초안에 대한 관리자 검토 섹션을 `/admin/class-posts` 상단에 추가하고, 게시/숨김 상태 변경을 `UpdateClassPostStatusButton`으로 연결했습니다.
- 교사 권한 보완: 숨김된 게시글에 대해 `재검토 요청` 버튼을 제공하고 목록 요약에서 승인 대기/숨김 안내 문구를 노출했습니다.
- 부모 포털 노출 범위 확정: `getParentClassPosts`/`getParentClassPost`가 `status = 'published'`만 반환하도록 수정하고 정렬 기준을 `published_at → publish_at → created_at` 우선순위로 통일했습니다.
- 학사 일정 승인 플로우 구축: `/admin/class-schedules`에 승인 대기 패널과 게시/초안/취소 버튼을 추가하고, 취소 사유 입력 프롬프트·교사 안내 문구를 포함한 상태 뷰를 구성했습니다.
- 서버 액션 정합성: 게시 취소 시 `published_at`/`published_by`를 초기화하고 교사 작성 시 성공 메시지를 “승인 대기”로 안내하도록 정리했습니다.
- 급식 · 영양 관리 확장: 급식 수정 경로(`/admin/meals/[id]/edit`)와 첨부 URL 검증/중복 방지 로직을 추가하고, 영양 게시물 작성·수정·상태 전환 UI(초안/게시/보관)를 `/admin/meals`에 통합했습니다.
- 학부모 포털 급식 뷰 정비: `/parents/meals` 페이지를 신설해 게시된 식단을 날짜별로 그룹화하고 영양사 공지를 함께 노출하며, 대시보드 빠른 바로가기에 링크를 추가했습니다.
- 승인/검증 자동화: Playwright 테스트(`tests/approval-workflows.spec.ts`)로 반 소식·학사 일정 승인 흐름과 급식 첨부 검증/중복 방지 시나리오를 점검하도록 글로벌 테스트 유저/교실 시드를 확장했습니다.
- 급식 전체 공개 지원: `meal_plan_audience_scope` enum에 `all`을 추가하고 관리자/학부모 화면·쿼리를 반영했으며, 관련 ASCII 레이아웃도 최신 상태로 업데이트했습니다.
- 다음 단계 후보:
  1) 학부모 포털 반 소식 갤러리화(썸네일/라이트박스 UI),
  2) 학부모 학사 일정 달력형 뷰 구현(달력 컴포넌트 + 상태 필터),
  3) 학부모 급식 달력/미디어 프리뷰 고도화 및 퍼블릭 뉴스/포토 보강.

## PWA Strategy (Phase 3)
- 3단계 고도화(1개월) 일정에 선택 과업으로 PWA 배포를 포함해 핵심 포털 기능이 안정화된 뒤 설치형 경험을 제공 (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:1090-1103`).
- 기본 범위: 웹 앱 매니페스트·아이콘 세트 제작, 서비스 워커 기반 오프라인 셸, 마케팅·부모 포털 읽기 페이지 캐싱, 오프라인 안내 화면 준비.
- 구현 방안: Next.js에 `@ducanh2912/next-pwa` 등 PWA 번들러를 통합해 프리캐시 자산, API 런타임 캐싱 정책, 버전 업데이트 알림, 설치 프로모션을 구성.
- 확장 옵션: Stage 3 알림 기능과 연계한 웹 푸시, 상담/문의 폼 오프라인 전송 큐, PWA 설치/제거 이벤트 분석 반영, 홈 화면 배경 이미지 가이드.
- 선행 조건: 브랜드 아이콘 패키지 확정, 저장소/보안 정책 검토, 접근성·성능 예산 재확인, 부모 포털 인증 흐름과 서비스 워커 캐싱 범위 정렬.

## News Content & Admin Strategy
- **운영 원칙**: 공지·가정통신문·행사 등 알림 콘텐츠는 외부 CMS 없이 Next.js 기반 내부 Admin 대시보드에서 직접 작성·관리합니다.
- **데이터 스키마 초안** (Vercel Postgres 기준, Drizzle/Prisma 마이그레이션 예정):
  - `news_posts`(id, title, slug, category, summary, content, hero_image_url, hero_image_alt, publish_at, is_highlighted, audience_scope, created_by, updated_at).
  - `news_attachments`(id, post_id FK, file_url, label) — 필요 시 확장.
- **Admin UI 요구사항**:
  - `/admin/news` 목록/검색/필터(카테고리, 게시 상태), `/admin/news/new` 작성 에디터(Rich Text + 이미지 업로드), `/admin/news/[id]/edit`.
  - 게시/수정 시 홈 프리뷰 및 `/news` 캐시 무효화(`revalidateTag("news")`).
  - `audience_scope` 설정으로 전 회원/승인 학부모 전용 콘텐츠 구분. 승인 전 사용자가 부모 포털용 게시글 요청 시 안내 페이지 이동.
- **API 구조**:
  - Server Action 또는 Route Handler(`/api/news`, `/api/news/[slug]`)가 Vercel Postgres를 직접 조회.
  - CRUD는 Admin Server Action에서만 수행하며, Public API는 read-only. 캐싱은 ISR(`revalidate` 분단위)과 Route Handler의 `cache: 'no-store'` 조합으로 결정.
- **향후 확장**:
  - 게시글 저장 시 PWA 알림 큐 등록, 이미지 업로드는 Vercel Blob/S3 등으로 분리.
  - 필요 시 Admin에서 베타용 CMS export/import 기능 제공.

## Authentication & Approval Workflow
- **기술 스택**: NextAuth.js + Vercel Postgres. `@auth/prisma-adapter` 또는 Drizzle Adapter 고려(향후 선택에 따라 DB Layer 확정).
- **로그인 수단**:
  - Email/Password(자체) with Email verification (magic link 대체 가능).
  - OAuth Providers: Google, Kakao(또는 Naver) 최소 1개 이상 지원. Provider 동의 화면 문구 사전 점검.
- **회원가입 흐름**:
  1. 자유 가입 → 이메일 인증 완료 시 `status = "pending"` 상태로 저장.
  2. 관리자가 `/admin`에서 승인하면 `role = "parent"` 및 `status = "active"`로 전환.
  3. 승인 전에는 공공 페이지 및 CMS 공개 게시글만 접근 가능, 부모 포털(`parents/*`) 접근 시 안내 페이지 또는 “승인 대기” 메시지 표시.
- **데이터 스키마 초안**:
  - `users`(id, email, passwordHash?, name, provider, status, createdAt, updatedAt).
  - `user_profiles`(userId FK, phone, 가족 정보 등), `user_roles` or `role` enum (parent, admin, teacher 등).
  - `children`(id, userId FK, name, birthYear, classId 등) – 승인 후 입력 가능.
- **접근 제어**:
  - `middleware.ts`에서 `/parents` 및 `/admin` 라우트 보호.
  - 부모 포털: `role=parent` + `status=active`만 접근 허용.
  - `/admin`: `role=admin` 전용.
  - 미승인 사용자는 `/member/pending` 안내 페이지(추후 구현)로 리다이렉트.
- **운영 플로우**: 임시 베타 계정은 관리자가 수동 생성 → 정식 서비스 시에는 가입 후 승인을 기본으로 전환.

## Admin Scope & Kickoff Plan
- 관리자 대시보드, 콘텐츠 관리, 통계, 자동 백업 요구사항을 초기에 함께 구현합니다 (`신촌몬테소리유치원_개선안_요약본.md:99-109`, `신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:234-244`).
- Next.js 내 `/admin` 경로나 별도 레이아웃을 준비하여 shadcn/ui 컴포넌트(테이블, 폼, 차트 등)로 구성하고, NextAuth + Route Handler/Server Action 가드로 역할 기반 접근을 제어합니다 (`신촌몬테소리유치원_기능_명세서.md` 전반).
- Vercel DB 스키마는 관리자와 학부모 포털이 동일한 데이터 모델을 공유하도록 설계하고 버전 관리된 SQL 마이그레이션으로 추적합니다 (`신촌몬테소리유치원_기능_명세서.md:27-74`, `262-320`).

## Legacy Site Findings to Address
- No viewport meta tag → mobile renders scaled-down (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:111-123`).
- Legacy `slidesjs` carousel failure + favicon 404s (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:112-124`).
- Authentication-gated pages rely on alert dialogs; must redirect with guidance (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:171-187`).
- Current 팝업이 네이버 폼 외부 의존, 쿠키 기반 on/off만 제공 (`신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:220-244`).
- 회원정보 수정은 단일 화면, 자녀 정보 최대 3명 입력, 전화번호 3분할 필드, zip 팝업 사용 등 마이그레이션 시 주의 (`신촌몬테소리유치원_사이트맵_및_페이지구조.md:1180-1183`).
- 반별 교육활동 게시판은 텍스트 목록 + 테이블형 상세(이미지 다중 첨부) 구조로 이미지 미리보기·요약·교사 메타 정보가 부재하며, hover 메뉴/무한 페이지네이션/HTTP 이미지로 접근성과 보안 경고 문제가 발생.
- 월별 행사 달력은 `<table>` + inline `onclick` 패턴에 의존해 키보드 내비게이션이 불가능하고, 상세 페이지가 조회수 외 콘텐츠가 없어 일정 맥락·첨부 제공이 이뤄지지 않음.
- 급식 게시판은 (1) 하루 식단 정보를 달력 셀에 장문 텍스트로만 노출하고 (2) 영양소식 게시물은 JPG/스캔 이미지를 단일 첨부로 제공해 검색·다운로드·데이터 재활용이 어려움.

## Current Assets
- `신촌몬테소리유치원_개선안_요약본.md` — high-level goals and phased plan.
- `신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md` — detailed UX, content, and tech requirements.
- `신촌몬테소리유치원_사이트맵_및_페이지구조.md` — structural layout and per-page expectations.
- `신촌몬테소리유치원_기능_명세서.md` — functional specs plus API/data models.
- Repository root — Next.js(App Router) 기반 프런트엔드 (TypeScript, Tailwind, ESLint, npm).
- `src/app/styleguide/page.tsx` — shadcn/ui 기반 컴포넌트 프리뷰 페이지 (Hero, 카드, 탭, 테이블, 폼 샘플).
- `src/lib/db.ts` — Vercel DB(PostgreSQL) 연결을 위한 공유 헬퍼와 헬스체크 유틸리티.
- `src/app/api/health/route.ts` — 서버리스 헬스 엔드포인트로 DB 연결 상태를 확인.
- `src/lib/design-tokens.ts` — Petit 테마에 맞춘 컬러·타이포·스페이싱·섀도 토큰 정의.
- `AGENT.md` (this file) — coordination reference and change log root.
- `src/app/news` — 알림마당 목록/카테고리/상세 페이지 스캐폴딩과 데모 데이터 연동.
- `src/lib/data/news.ts` — 공지/가정통신문/행사 카테고리 더미 데이터 및 헬퍼.
- `src/app/parents/page.tsx`, `src/app/member/login/page.tsx` — 부모 포털 안내 및 이메일 로그인 화면.
- `src/app/member/register/page.tsx`, `src/app/member/register/actions.ts` — 회원가입 폼과 서버 액션.
- `src/lib/auth/password.ts` — PBKDF2 기반 비밀번호 해시/검증 헬퍼.
- `src/lib/auth/options.ts`, `src/lib/auth/index.ts` — NextAuth 설정과 helper(`auth`, `handlers`, `signIn` 등).
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth Route Handler.
- `middleware.ts` — 학부모/관리자 라우트 접근 제어 가드.
- `drizzle.config.ts`, `src/db/schema.ts` — Drizzle 마이그레이션 설정과 스키마 정의.
- `drizzle/` — 생성된 마이그레이션 SQL(`0000_dear_lockjaw.sql`)과 메타(`meta/`) 파일.
- `docs/module-requirements-phase1.md` — 반 소식/학사 일정/급식 모듈 1단계 요구사항 정리(2025-10-27 작성).

## Workflow for Agents
1. **Before Editing**
   - Review relevant spec sections to avoid diverging from approved scope.
   - Confirm whether changes impact multiple documents; keep them synchronized.
2. **While Editing**
   - Prefer `apply_patch` for manual edits; document assumptions inline with concise comments only when necessary.
   - Align UI work with shadcn/ui patterns; capture component decisions back in the specs if new patterns emerge.
3. **After Editing**
   - Update affected `.md` specs and append a summary entry under “History Log” below.
   - Note any outstanding questions or follow-up tasks in the specs (e.g., TODO blocks).
   - If new assets are added, list them under **Current Assets** in this guide.
4. **Communication**
   - Keep references to spec line numbers when reporting changes to maintain traceability.
   - When introducing new tooling or architectural shifts, document rationale in both the relevant spec and the History Log.
   - 사용자 요청에 따라 대화 및 보고는 기본적으로 한국어로 진행합니다.

## Immediate Next Steps (2025-10-29)
- 배포 전 스테이징/운영 DB에서 `meal_plan_audience_scope`에 `all` 값이 적용됐는지 최종 확인(로컬 메타/시드 반영 완료).
- 반 소식/학사 일정 승인 워크플로에서 교사 재검토 요청 알림(메일/슬랙 웹훅)과 관리자 알림 큐를 설계하며 상태 변경 서버 액션 로깅을 추가.
- 퍼블릭 급식 QA 체크리스트(`docs/module-requirements-phase1.md:162-169`) 중 접근성·모바일 검증을 수행하고 결과를 기록.

## Parent & Public Meal Rollout Plan (3단계)
1. ✅ **1단계 — 반 소식 미디어 개선** (완료 2025-10-29)  
   - 학부모 목록·상세에 이미지 썸네일/갤러리 추가, 첨부 분류 로직 정리.  
   - 관리자 승인 패널과 교사 재검토 버튼을 UI에 연결.
2. ✅ **2단계 — 학사 일정 월간 캘린더화** (완료 2025-10-29)  
   - `/parents/schedule`에 달력/상태 필터를 도입하고, 취소 사유 표시를 포함.  
   - Admin 일정 목록에 취소/재게시 버튼과 승인 큐를 배치.
3. ✅ **3단계 — 급식 공개 & 영양 콘텐츠 확장** (완료 2025-10-29)  
   - 퍼블릭 `/meals` 페이지에 MealCalendar/첨부 프리뷰 공개 완료.  
   - `scripts/seed-parents.ts`에 전체 공개 식단 샘플과 학부모 전용 간식 데이터를 추가하고, Drizzle 메타(`drizzle/meta/0002_snapshot.json`)에 `audience_scope = 'all'` 값을 반영.  
   - 영양 게시물 CRUD/상태 토글 및 첨부 URL 검증 강화 (`src/app/admin/meals/*`, `src/app/admin/meals/actions.ts`).  
   - Playwright 회귀(`tests/meals-public.spec.ts`, `tests/approval-workflows.spec.ts`)로 공개 범위 전환과 검증 시나리오 추가.

## Legacy Alignment Workstream (2025-10-29)
1. ✅ **Stage 1 — 상단 네비게이션/앵커 재정렬**  
   - 헤더 메뉴를 Legacy 용어(유치원 소개·교육환경·교육과정·우리들 이야기·신촌소식·오늘의 식단)에 맞춰 복구.  
   - 홈에 `#environment` 섹션을 추가해 교육환경 콘텐츠 이동 경로 확보.
2. ✅ **Stage 2 — 급식 UI (오늘의 식단) 재구성**  
   - 월간 표 + 패널 기반 UI로 전환하고, 기존 데이터를 활용한 날짜별 상세 패널을 구현.  
3. ✅ **Stage 3 — 반별 교육활동 목록/상세 조정**  
   - 학부모 목록을 번호·반·제목·게시일·첨부 테이블로 재구성하고 사진/파일 개수 뱃지를 제공.  
   - 상세는 반투명 오버레이 모달에서 사진 라이트박스 카드와 첨부 링크 패널로 표시.  
4. ✅ **Stage 4 — 로그인 전/후 접근 플로우 정비**  
   - `/stories/class-news` 공개 요약 페이지를 추가하고 로그인 모달과 함께 목록 미리보기를 제공.  
   - 비로그인 사용자가 `/parents/posts` 진입 시 요약 페이지로 안내하고 즉시 로그인 모달을 띄우도록 조정.  
5. ✅ **Stage 5 — 관리자 폼 안내 강화**  
   - 반 소식/급식 폼에 프런트 노출 예시와 필드 매핑 가이드를 추가해 운영자가 입력 결과를 즉시 파악할 수 있도록 지원.

## History Log
- 2025-11-20 — 갤러리 라이트박스 전환: 카드 그리드 + 공통 라이트박스로 재구성하고, 썸네일 휠/드래그 가로 스크롤·활성 썸네일 중앙 정렬·Home/End/←/→ 지원으로 다량 이미지 탐색을 단순화했다. 페이드/드래그 오동작 제거, 썸네일·제목·설명을 이미지 하단에 분리해 가려짐 문제를 해결.
  - 2025-11-20 — 라이트박스 내비 보완: 메인 이미지 클릭 전환 제거(화살표/썸네일/키보드 중심), 썸네일 중앙 정렬·메타 표시 유지, 썸네일 드래그 차단 로직 제거·포인터 이벤트 보강으로 클릭 전환 안정화.
- 2025-11-20 — 교육행사 데이터/UX 고도화: Legacy 교육행사 12건을 Playwright로 재수집해 `class_schedules`에 보호자 공개 범위와 친근한 설명을 저장하고 중복 식별(`LEGACY_EVENT_ID`)·`--refresh` 옵션을 `scripts/import-legacy-events.ts`에 추가했으며, `/stories/events` 카드/모달 카피와 썸네일 스크롤 UI를 반별·연령 갤러리 패턴과 맞췄습니다.
- 2025-11-16 — Legacy 몬테소리 교육 페이지 내용을 `/education/montessori`로 재구성하고 이미지 플레이스홀더·데이터 소스를 추가, CurriculumSidebar 경로와 Playwright 회귀 테스트를 업데이트해 신규 교육과정 뷰를 안정화.
- 2025-11-16 — Legacy 기독교 유아교육 페이지를 `/education/christian-education`으로 이관하여 소개·핵심 기둥·컴패션 후원 탭 UI를 구축하고, 후원 어린이 사진/데이터와 헤더/사이드바 링크·Playwright 테스트를 동기화.
- 2025-11-16 — Legacy 생태 유아교육 페이지를 `/education/eco-education`으로 이관해 소개 문단·활동 카드·사진 플레이스홀더를 재구성하고, 네비게이션/사이드바 링크 및 Playwright 테스트를 업데이트.
- 2025-11-16 — 부모교육 1단계 UI 스캐폴딩: `/education/parent-education` 페이지, 더미 데이터, 탭/게시판/검색/페이징 플레이스홀더, 네비게이션 경로, Playwright 테스트(`tests/parent-education.spec.ts`)를 추가해 향후 DB/어드민 연동 기반을 마련.
- 2025-11-16 — 부모교육 2단계(DB/API): Drizzle 스키마·마이그레이션(`parent_education_posts/attachments`), 데이터 레이어(`src/lib/data/parent-education-repository.ts`), 목록/상세 API(`/api/parent-education`, `/api/parent-education/[slug]`)를 추가해 후속 어드민·UI 연동 준비 완료.
- 2025-11-16 — 부모교육 3단계(어드민·상세 연동): `/admin/parent-education` CRUD UI와 서버 액션, `/education/parent-education` 목록의 DB 데이터/검색/페이지네이션, `/education/parent-education/[slug]` 상세 페이지, 조회수 증가 액션, Playwright 스펙 업데이트로 전체 흐름을 DB 기반으로 전환.
- 2025-11-16 — 우리들 이야기 개선: `src/data/class-stories.ts`에 반별 갤러리 데이터를 (개나리/민들레/백합/장미/방과후) 정의하고 `/stories/class-news` 상단에 shadcn Tabs+갤러리를 추가해 반별 활동 탭 미리보기 제공, 로그인 상태에 따라 CTA가 전환되며 테이블 앵커와 갤러리 카드 높이를 통일.
- 2025-10-29 — 상단 네비게이션을 Legacy 용어·경로(유치원 소개/교육환경/교육과정/우리들 이야기/신촌소식/오늘의 식단)로 재배치하고 홈에 `#environment` 섹션을 추가해 교육환경 안내를 제공.
- 2025-10-29 — 급식 페이지(학부모/퍼블릭)를 월간 표 + 상세 패널 구조로 재구성하여 기존 “오늘의 식단” 흐름을 유지하면서 사진·첨부 미리보기를 제공.
- 2025-10-29 — 반 소식 Stage 3: `/parents/posts`를 테이블형 게시판으로 전환하고 상세 페이지를 라이트박스 모달로 개편해 Legacy UX를 보존하면서 최신 스타일을 적용.
- 2025-10-29 — 로그인 플로우 Stage 4: `/stories/class-news` 공개 요약 페이지와 로그인 모달을 도입하고, 비로그인 접근 시 요약→로그인→상세 순서로 유도하도록 네비게이션과 리디렉션을 정비.
- 2025-10-29 — 급식 Stage 3: 퍼블릭/학부모 식단 UI 통합, `scripts/seed-parents.ts`에 전체 공개 식단 샘플 추가, `drizzle/meta/0002_snapshot.json` enum 갱신, `tests/meals-public.spec.ts`·`tests/approval-workflows.spec.ts`로 회귀 시나리오 보강.
- 2025-11-05 — 인사말 모듈을 DB/어드민 기반에서 정적 데이터(코드 내 관리)로 전환하여 `/admin/intro/greetings`와 관련 seed 스크립트를 제거하고 `/intro/greeting`은 코드 편집만으로 즉시 반영되도록 단순화.
- 2025-10-29 — 공식 인사말 전용 라우트(`/intro/greeting`)를 추가하고 헤더 네비게이션을 Legacy 구조(유치원 소개 > 인사말/이사장/원장/교사)와 동일하게 동작하도록 조정.
- 2025-10-29 — Stage 5 완료: `/admin/class-posts`와 `/admin/meals` 폼에 프런트 미리보기 패널과 필드별 노출 가이드를 추가해 Legacy 스타일 입력 흐름을 보강.
- 2025-10-29 — 학부모 포털 반 소식에 갤러리 썸네일/상세 사진 그리드를 추가하고, 학사 일정 달력/필터, 급식 달력 + 이미지/첨부 뷰를 통합. 퍼블릭 `/meals` 페이지에서 전체 공개 급식·영양 안내를 제공하고 `docs/ascii-wireframes.md`를 최신 레이아웃(퍼블릭/학부모/어드민)으로 갱신해 요구 변화(급식 전체 공개)를 기록.
- 2025-10-22 — Initial AGENT.md created from v1.0 specification set; established shadcn/ui as mandatory UI layer and recorded legacy remediation items.
- 2025-10-23 — Evaluated TypeScript 풀스택 옵션(Next.js + tRPC + Prisma + PostgreSQL + Redis + NextAuth)과 관리자 워크스페이스 초기 범위를 확정.
- 2025-10-23 — Initialized Git repository using separate `.gitdir` store (workspace is `/Users/c2/Documents/Personal/shinchon-saessaks`) and added base project docs/configs.
- 2025-10-23 — Added Prettier configuration (`.prettierrc`) with shared formatting rules (tabs, width 120, trailing commas, etc.).
- 2025-10-23 — Scaffolded Next.js project at repo root (TypeScript, Tailwind, ESLint, npm) and verified with `npm run lint`.
- 2025-10-23 — Initialized shadcn/ui CLI, added core components (button, card, badge, tabs, table, input, textarea, label), created `/styleguide` preview page, and restructured project to live at root for simpler layout.
- 2025-10-23 — Applied kindergarten-friendly pastel theme tokens in `globals.css`, switched to Fredoka + Noto Sans KR fonts, and refreshed `/styleguide` to mirror Petit 레퍼런스 무드.
- 2025-10-24 — 전반적인 백엔드 전략을 Next.js 서버리스 + Vercel DB(PostgreSQL) 기반으로 전환하고 공유 DB 헬퍼(`src/lib/db.ts`) 및 `/api/health` 헬스체크 엔드포인트를 추가, AGENT 가이드를 업데이트.
- 2025-10-24 — Downloads 아카이브의 Petit Theme 디자인 시스템을 반영해 `globals.css`, UI 컴포넌트, 랜딩 페이지, `styleguide` 전반의 토큰과 서체를 교체.
- 2025-10-24 — Stage 3 선택 과업인 PWA 전략을 정의하고 범위·선행 조건·기술 선택을 AGENT 가이드에 기록.
- 2025-10-25 — 공개 홈페이지 헤더/푸터를 공용 컴포넌트화하고 홈 섹션을 명세 기반으로 스캐폴딩, 알림마당/학부모 포털/로그인 플레이스홀더 라우트를 추가.
- 2025-10-25 — 내부 Admin에서 News/공지 콘텐츠를 관리하는 전략과 NextAuth 승인 흐름 설계안을 작성하고 AGENT 가이드에 반영.
- 2025-10-27 — Phase 2 스키마 확장을 위해 `docs/module-requirements-phase1.md`에 DB/API 초안을 기록하고, Drizzle 스키마/마이그레이션(`0005_phase2_core.sql`)을 추가해 반 소식·학사 일정·급식 테이블 및 역할 권한을 구조화.
- 2025-10-25 — 회원가입 폼과 서버 액션을 추가하고 PBKDF2 기반 비밀번호 해시 헬퍼를 도입.
- 2025-10-25 — Drizzle ORM 기반 마이그레이션 체계를 도입하고 `schema.ts`, `drizzle.config.ts`, 마이그레이션 SQL을 추가.
- 2025-10-25 — NextAuth Credentials 기반 로그인(`/member/login`), 인증 미들웨어, `/api/auth` 라우트를 구성하고 테스트.
- 2025-10-26 — https://www.shinchonkid.com 공개 게시판에서 공지/가정통신문/월별 행사를 수집해 초기 마이그레이션 자료로 정리하고, `/admin` 콘솔(Server Action + Vercel Postgres)을 구축하여 게시글 등록·목록·삭제 기능 및 5분 글로벌 타임아웃(Playwright)을 추가함.
- 2025-10-27 — (`news_posts`, `news_attachments`) 데이터와 `/news` 페이지 전체가 DB 연동으로 교체되었고, 홈 뉴스 하이라이트 역시 DB 데이터를 사용하도록 업데이트. 관리자 콘솔에는 Toast UI Editor 기반 본문 작성 기능 및 첨부 URL 관리가 추가됨.
- 2025-10-27 — 학부모 포털 1단계: `classrooms`/`children` 등 Drizzle 스키마 확장, seed 스크립트(`db:seed:parents`) 작성, `/parents` 대시보드에서 자녀/반 소식이 실제 DB 데이터로 렌더링되도록 구현.
  ```json
  {
    "notice": [
      {
        "title": "2026학년도 신촌유치원 입학설명회",
        "url": "https://www.shinchonkid.com/web/customer/notice_view.html?no=184",
        "textSnippet": "2026학년도 신촌유치원 입학설명회를 다음과 같이 개최합니다. 아래 입학설명회 포스터에 있는 QR코드 또는 네이버폼 링크 https://naver.me/5tfNnVEf 를 통해 신청해주세요^^",
        "images": [
          "http://www.shinchonkid.com/web/upload/1759389487_344067.jpg"
        ]
      },
      {
        "title": "2024학년도 신촌유치원 결산서",
        "url": "https://www.shinchonkid.com/web/customer/notice_view.html?no=182",
        "textSnippet": "2024학년도 신촌유치원 결산서를 붙임과 같이 공개합니다.",
        "images": []
      },
      {
        "title": "2025년 4월 식단",
        "url": "https://www.shinchonkid.com/web/customer/notice_view.html?no=181",
        "textSnippet": "",
        "images": [
          "http://www.shinchonkid.com/web/upload/1743580441_931293.jpg",
          "http://www.shinchonkid.com/web/upload/1743580451_735374.jpg"
        ]
      },
      {
        "title": "2024학년도 하반기 급식비 중 식품비 사용 비율",
        "url": "https://www.shinchonkid.com/web/customer/notice_view.html?no=180",
        "textSnippet": "2024학년도 하반기 급식비 중 식품비 사용 비율입니다.",
        "images": []
      },
      {
        "title": "2024 유치원 자체평가 결과 보고서",
        "url": "https://www.shinchonkid.com/web/customer/notice_view.html?no=179",
        "textSnippet": "",
        "images": [
          "http://www.shinchonkid.com/web/upload/1742888084_096720.jpg",
          "http://www.shinchonkid.com/web/upload/1742888182_895500.jpg"
        ]
      }
    ],
    "correspondence": [
      {
        "title": "10월 가정통신문-10월3주",
        "url": "https://www.shinchonkid.com/web/customer/correspondence_view.html?no=581",
        "images": [
          "http://www.shinchonkid.com/web/upload/1760685910_455750.jpg",
          "http://www.shinchonkid.com/web/upload/1760685916_284677.jpg"
        ]
      },
      {
        "title": "10월 가정통신문-10월2주",
        "url": "https://www.shinchonkid.com/web/customer/correspondence_view.html?no=580",
        "images": [
          "http://www.shinchonkid.com/web/upload/1759393155_027558.jpg",
          "http://www.shinchonkid.com/web/upload/1759393160_161442.jpg"
        ]
      },
      {
        "title": "10월 가정통신문-10월1주",
        "url": "https://www.shinchonkid.com/web/customer/correspondence_view.html?no=579",
        "images": [
          "http://www.shinchonkid.com/web/upload/1758872926_681268.jpg",
          "http://www.shinchonkid.com/web/upload/1758872932_597075.jpg"
        ]
      },
      {
        "title": "9월 가정통신문-9월4주",
        "url": "https://www.shinchonkid.com/web/customer/correspondence_view.html?no=578",
        "images": [
          "http://www.shinchonkid.com/web/upload/1758270754_591441.jpg",
          "http://www.shinchonkid.com/web/upload/1758270761_172037.jpg"
        ]
      },
      {
        "title": "9월 가정통신문-9월3주",
        "url": "https://www.shinchonkid.com/web/customer/correspondence_view.html?no=577",
        "images": [
          "http://www.shinchonkid.com/web/upload/1757665293_768649.jpg"
        ]
      }
    ],
    "monthlyEvents": [
      {
        "title": "다문화교육(필리핀)",
        "url": "https://www.shinchonkid.com/web/customer/month_view.html?no=1217",
        "textSnippet": "-"
      }
    ]
  }
  ```
- 2025-10-29 — Legacy 구조와의 괴리를 줄이기 위한 재정렬 계획 합의 (네비게이션 복구, 급식 테이블·팝업 유지, 반 소식 테이블/모달 전환) 및 다음 단계(네비게이션→급식→반 소식→로그인 흐름→관리자 안내) 작업 순서를 정의.

---

## Web Standards & Build Guardrails (Next.js 전용 / 추가 섹션)

> 이 섹션은 **빌드 안정성**과 **웹 표준 준수**만을 다룹니다. React 19 고유 API 내용은 포함하지 않습니다.

### A) Build: Fail‑Fast 파이프라인
- **패키지 스크립트(권장)** — 경고도 실패 처리하여 일관된 빌드를 보장합니다.
```json
{
  "scripts": {
    "dev": "next dev",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "prebuild": "node scripts/check-env.mjs",
    "build": "npm run lint && npm run typecheck && next build",
    "start": "next start"
  },
  "engines": { "node": ">=18.18" }
}
```

- **환경 변수 검증** — 누락 시 빌드 실패(서버/클라이언트 공통).
```js
// scripts/check-env.mjs
const REQUIRED = [
  // 예시: 'NEXT_PUBLIC_SITE_URL', 'DATABASE_URL', 'AUTH_SECRET'
];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("[check-env] Missing env:", missing.join(", "));
  process.exit(1);
}
console.log("[check-env] OK");
```

- **CI 예시(GitHub Actions)** — PR에서 반드시 타입/린트/빌드가 통과해야 머지됩니다.
```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request, push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20' # LTS 권장
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

### B) Next.js 안전 기본값
- **`next.config.ts`** — 보안/정합성 기본값만 설정합니다.
```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { typedRoutes: true },
  images: {
    // 필요 시 도메인 화이트리스트: domains: ["www.shinchonkid.com"]
  },
};

export default nextConfig;
```

- **캐싱 규칙(요약)**  
  - 읽기 페이지: 적절한 ISR 주기(`export const revalidate = 300`)를 명시해 정적화 + 갱신.
  - 수정/생성 API(Route Handler): **`cache: "no-store"`**로 명시하고, 변경 후 **`revalidateTag(...)`** 또는 **`revalidatePath(...)`**로 읽기 캐시 무효화.

### C) 의미론 & 접근성 (웹 표준, WCAG 2.2 AA)

> Next.js 기반 웹에서 **의미론적 마크업**과 **키보드·스크린리더 접근성**을 보장하기 위한 최소 준수 가이드입니다. 설치 지침 없이 작업 코드/리뷰 기준만 규정합니다.

#### C-1. 문서 구조 / 랜드마크
- 레이아웃 기본: `<header> → <nav> → <main id="main-content"> → <footer>` 를 유지합니다.
- 페이지 언어/문서 정보:
  - `<html lang="ko">` 를 명시합니다.
  - `metadata`(App Router)로 제목·설명을 설정합니다.
- “본문 바로가기” 링크를 최상단에 두고 키보드 초점에 표시합니다.
```tsx
// src/app/layout.tsx
export const metadata = { title: "신촌몬테소리유치원", description: "유치원 소개 및 학부모 포털" };

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="ko">
			<body>
				<a href="#main-content" className="sr-only focus:not-sr-only">본문 바로가기</a>
				<header>{/* ... */}</header>
				<nav aria-label="주요">{/* ... */}</nav>
				<main id="main-content">{children}</main>
				<footer>{/* ... */}</footer>
			</body>
		</html>
	);
};

export default RootLayout;
```

#### C-2. 인터랙션 요소
- **버튼은 항상 `<button>`** 을 사용합니다. 폼 외부 버튼은 `type="button"` 을 명시합니다.
- 진행/요청 중에는 **`disabled + aria-busy`** 로 중복 클릭을 방지합니다.
- 토글형 버튼은 상태를 **`aria-pressed`** 로 노출합니다.
```tsx
// src/components/Button.tsx
type Props = JSX.IntrinsicElements["button"] & { pending?: boolean };

const Button = ({ pending = false, children, type = "button", ...rest }: Props) => {
	return (
		<button type={type} disabled={pending || rest.disabled} aria-busy={pending} {...rest}>
			{pending ? "처리 중…" : children}
		</button>
	);
};

export default Button;
```

#### C-3. 폼 / 오류 / 라이브 영역
- 모든 입력은 `<label for>` ↔ `id` 를 매핑합니다. 시각적 레이블 대신 placeholder만 두지 않습니다.
- 검증 오류는 **`role="alert"`** 로 알리고, 폼의 성공/진행 메시지는 **`aria-live="polite"`** 를 고려합니다.
```tsx
// src/components/SimpleForm.tsx
const SimpleForm = () => {
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			// 서버 호출 또는 클라이언트 검증 로직…
			setError(null);
		} catch {
			setError("저장 중 오류가 발생했습니다.");
		}
	};

	return (
		<form onSubmit={onSubmit} aria-describedby={error ? "form-error" : undefined}>
			<label htmlFor="name">이름</label>
			<input id="name" name="name" required />
			<button type="submit">저장</button>
			{error && (
				<p id="form-error" role="alert" aria-live="assertive">
					{error}
				</p>
			)}
		</form>
	);
};

export default SimpleForm;
```

#### C-4. 내비게이션 / 링크
- 내부 페이지 이동은 **`<Link>`** 를 사용해 접근성과 퍼포먼스를 보장합니다.
- 새 창 열기 시 `rel="noopener noreferrer"` 를 함께 설정하고, 시각적으로 “(새 창)” 안내를 제공합니다.

#### C-5. 이미지 / 미디어
- 정보 전달용 이미지는 **의미 있는 `alt`** 를 제공합니다. 장식용은 빈 `alt=""` 로 스크린리더 무시.
- 영상/오디오에는 자막/대체 텍스트를 제공합니다(필요 시 캡션 파일 연동).

#### C-6. 표(테이블) / 데이터 그리드
- 표에는 `<caption>` 으로 목적을 설명하고, 헤더 셀에는 `scope="col|row"` 를 명시합니다.
```tsx
// src/components/MealsTable.tsx
const MealsTable = ({ days }: { days: { date: string; menu: string }[] }) => {
	return (
		<table>
			<caption>이번 달 식단</caption>
			<thead>
				<tr>
					<th scope="col">날짜</th>
					<th scope="col">메뉴</th>
				</tr>
			</thead>
			<tbody>
				{days.map((d) => {
					return (
						<tr key={d.date}>
							<td>{d.date}</td>
							<td>{d.menu}</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default MealsTable;
```

#### C-7. 포커스 / 키보드
- 키보드만으로 모든 인터랙션이 가능해야 합니다. `focus-visible` 기반 포커스 링을 숨기지 않습니다.
- 모달/오버레이는 **포커스 트랩**을 적용하고 닫힐 때 **트리거로 포커스 복귀**합니다.

#### C-8. 색상 대비 / 모션
- 텍스트 대비 **4.5:1 이상**(큰 텍스트 3:1). 배경-포커스링 대비도 확보합니다.
- 과도한 모션은 `prefers-reduced-motion` 을 존중합니다.

#### C-9. Next.js 캐싱과 접근성의 조화
- 읽기 페이지는 ISR(`export const revalidate = ...`)을 사용하되, 콘텐츠 변경 후 **`revalidateTag/Path`** 로 즉시 최신 상태를 반영합니다.
- 접근성 알림(예: 저장 성공 토스트)은 클라이언트에서 라이브 영역으로 보완합니다.

#### C-10. 리뷰 & 테스트 체크리스트 (PR 필수)
- [ ] 랜드마크/헤딩 계층이 논리적이다. `main` 영역이 하나이며 “본문 바로가기”가 동작한다.
- [ ] 버튼/링크 역할이 올바르다. 버튼은 `<button>`, 내비게이션은 `<Link>`.
- [ ] 폼 레이블/에러 공지가 스크린리더에 노출된다(`label`, `role="alert"`).
- [ ] 이미지 `alt` 가 적절하다(장식용은 빈 alt).
- [ ] 키보드만으로 모든 상호작용이 가능하고, 포커스 링이 항상 보인다.
- [ ] 표는 `caption` 과 `scope` 를 포함한다.
- [ ] 내부 이동은 `<Link>` 사용, 새 창 링크는 새 창 안내와 `rel` 설정을 포함한다.
- [ ] 접근성 기반 테스트 1건 이상(Testing Library `getByRole` 권장).

### D) 네트워크 중복 요청 방지
- **Single‑Flight**: 동일 키(메서드+URL+쿼리)의 동시 요청은 하나로 합칩니다.
```ts
// src/lib/singleFlight.ts
type AnyPromise<T> = Promise<T>;
const inflight = new Map<string, AnyPromise<unknown>>();

export const singleFlight = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const ex = inflight.get(key);
  if (ex) return ex as AnyPromise<T>;
  const p = fn().finally(() => { inflight.delete(key); });
  inflight.set(key, p as AnyPromise<unknown>);
  return p;
};
```
- **AbortController**: 검색어 변경/탭 전환 시 이전 요청을 취소합니다.
```ts
// src/lib/abortableFetch.ts
export const abortableFetch = () => {
  let controller: AbortController | null = null;

  const run = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (controller) controller.abort("stale");
    controller = new AbortController();
    return fetch(input, { ...init, signal: controller.signal });
  };

  return { run };
};
```

### E) PR 체크리스트(필수)
- [ ] `next build` 무경고/무오류, `tsc --noEmit` 통과, ESLint/Prettier 통과
- [ ] 버튼/폼에 중복 요청 방지(가드·Single‑Flight·취소 중 1+) 반영
- [ ] 시맨틱 랜드마크/헤딩 구조, 라벨-입력 매핑, 포커스 링 노출, 이미지 `alt` 확인
- [ ] 내부 이동은 `<Link>` 사용(브라우저 기본 동작 방해 금지)
- [ ] 읽기 경로 ISR 주기 명시, 갱신 시 `revalidate*`로 캐시 무효화

# 히스토리(추가)
- 2025-11-16 — **Web Standards & Build Guardrails(Next.js 전용) 섹션 추가** — 빌드 실패 방지 스크립트/CI, 의미론·접근성 체크리스트, 버튼 중복 요청 방지, 캐싱/무효화 규칙을 정리.

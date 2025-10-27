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

## Immediate Next Steps (Suggested)
- Document shadcn/ui 테마 변수와 적용 원칙(브랜드 컬러, 폰트 등)을 명세에 반영.
- Finalize NextAuth 흐름(비밀번호 재설정, 승인 거절 처리, 세션 만료 정책)을 명세화.
- Model Vercel DB(PostgreSQL) 스키마와 마이그레이션(회원/자녀/게시판/상담/알림 및 설정 테이블 포함) 설계를 착수.
- Scaffold `/admin` 레이아웃과 접근 제어 미들웨어 골격.
- Draft migration plan for legacy content, especially parent portal data and media.
- Start PWA discovery: 대상 라우트, 매니페스트 요구 아이콘, 서비스 워커 캐싱 정책, 오프라인 시나리오를 정의해 3단계 투입을 준비.
- Connect News section to `news_posts` 테이블 기반의 read API, 상세 페이지 SEO 메타 구조 확정.
- Model `news_posts`/`news_attachments` 등 주요 테이블을 Drizzle 스키마로 확장하고 Admin CRUD Server Action 설계.
- `/admin` 레이아웃 및 네비게이션, News/승인 관리 UI를 scaffolding하고 Server Action과 연결.
- Drizzle 마이그레이션을 CI/배포 흐름에 포함시키고 `npm run db:generate`/`npm run db:push` 운용 절차를 문서화.
- 부모 포털 `/parents` 초기 레이아웃과 승인 대기 안내 페이지 작성.

## History Log
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

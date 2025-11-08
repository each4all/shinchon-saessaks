# Phase 1 Module Requirements

본 문서는 Legacy 사이트 조사 내용을 바탕으로, 리뉴얼 1단계에서 우선 개선할 **반 소식(갤러리)**, **학사 일정(캘린더)**, **급식·영양 모듈**의 기능 요구사항과 사용자 흐름, 권한/데이터 설계를 정리한다. 이후 설계/구현 단계에서 이 문서를 참고해 세부 스토리와 개발 태스크를 분해한다.

---

## 1. 반 소식(갤러리) 모듈

### 1.1 목표
- 반별 활동 사진·동영상을 카드형으로 제공해 학부모가 최신 소식을 빠르게 파악.
- 교사가 작성한 콘텐츠를 관리자/검수자가 손쉽게 승인·편집·비공개 처리.
- 이미지 보안(https), 접근성 대체 텍스트, 모바일 경험을 Legacy 대비 향상.

### 1.2 주요 페르소나 & 흐름
- **교사/관리자 (작성자)**  
  1. `/admin/class-posts/new`에서 반 선택 → 제목·요약·본문 작성 → 미디어 업로드 → 미리보기 → 게시/예약.  
  2. 기존 게시물을 편집/비공개 처리.  
  3. 첨부 순서 변경, 표지 이미지 지정.
- **학부모 (열람자)**  
  1. `/parents/posts`에서 카드 목록 확인(필터: 자녀 반/최신/공지).  
  2. 카드 클릭 시 상세 뷰 → 라이트박스 갤러리, 첨부 파일 다운로드, 교사 메모 확인.  
  3. 선택한 이미지 저장, 필요 시 신고 요청(추가 고려).

### 1.3 권한/접근 제어
| 기능 | Admin | Teacher | Parent | Guest |
| --- | --- | --- | --- | --- |
| 게시글 생성/편집/삭제 | ✅ (모든 반) | ✅ (할당된 반만) | ❌ | ❌ |
| 미디어 업로드/삭제 | ✅ (모든 반) | ✅ (할당된 반만) | ❌ | ❌ |
| 게시글 열람 | 모든 반 | 담당 반 | 자녀 소속 반, 공개 범위 허용분 | ❌ |
| 공개 범위 설정 (전체/특정 반/비공개) | ✅ | 담당 반 범위 내 설정 가능 | ❌ | ❌ |

> `users.role`에 `teacher` 값을 추가하고, 교사-반 매핑 테이블(또는 `classrooms` 컬럼)로 담당 반을 관리한다. 관리자 콘솔에서는 기본적으로 전체 반 목록이 노출되지만, 교사 로그인 시 자신의 반만 편집 가능해야 한다.

### 1.4 데이터 요구사항
- `class_posts`
  - `title`, `summary`, `content`(Markdown 또는 Rich Text JSON)
  - `classroom_id`, `author_id`, `audience_scope` (enum: all, classroom, private)
  - `publish_at`, `status`(draft/published/archived)
- `class_post_media` (신규)
  - `post_id`, `file_url`, `thumbnail_url`, `media_type`(image/video), `alt_text`, `caption`, `display_order`, `is_cover`
- `class_post_tags` (옵션): 프로젝트/테마 태깅
- 감사필드: `created_at`, `updated_at`, `published_by`

### 1.5 UX & 기술 고려사항
- **갤러리 UX**: 썸네일 그리드 + Lightbox/Carousel, 확대/다운로드 옵션.
- **성능**: 이미지 리사이즈/썸네일 변환(Edge function or Upload provider), lazy loading.
- **알림**: 게시 또는 편집 시 부모 알림 발송(Phase 2+).
- **접근성**: alt 텍스트 필수, 키보드 네비게이션, 라이트박스 focus trap.
- **관리자 콘솔 UX**: Admin은 모든 반 목록과 상태 필터를, Teacher는 자신에게 할당된 반만 보도록 내비게이션/필터를 분기.
- **Draft/Preview**: 관리자 미리보기 URL(`/admin/class-posts/[id]/preview`) 유지·확장.

### 1.6 미해결 사항
- 자녀가 여러 반(방과후 포함)에 속할 경우 콘텐츠 노출 규칙.
- 댓글/피드백 기능 필요 여부(현재 미정).

---

## 2. 학사 일정(캘린더) 모듈

### 2.1 목표
- 전반/특정 반/행사 유형별 일정을 한 번에 조회.
- Legacy의 단순 테이블+onclick 구조를 접근성 높은 캘린더·리스트로 대체.
- 일정 상세에 첨부/연락처/준비물 정보를 구조화.

### 2.2 사용자 흐름
- **관리자/교사**
  1. `/admin/schedules`에서 월별 캘린더 확인, 일정 추가 버튼 → 제목/설명/일시/대상 반 지정 → 반복 옵션(필요 시) → 파일 첨부.  
  2. 일정 복제, 일정 간 링크(예: A/B 그룹) 설정.  
  3. 알림 전송 여부 선택(추후).
- **학부모**
  1. `/parents/schedule`에서 기본 월 뷰.  
  2. 자녀 반/행사 유형 필터 → 리스트 또는 캘린더 전환.  
  3. 일정 클릭 → 모달 또는 상세 페이지에서 설명, 준비물, 첨부 파일, 담당 교사 연락처 확인.  
  4. ICS/Google Calendar 내보내기(선택 사항).

### 2.3 권한/접근 제어
| 기능 | Admin | Teacher | Parent | Guest |
| --- | --- | --- | --- | --- |
| 일정 CRUD | ✅ (모든 반) | ✅ (할당된 반 및 자신이 생성한 일정) | ❌ | ❌ |
| 대상 반 설정 | ✅ (자유롭게) | ✅ (자신의 반 및 전원 옵션) | ❌ | ❌ |
| 일정 열람 | 전체 | 담당 반 중심 | 자녀 반 + 전체 행사 | ❌ |
| 첨부 다운로드 | ✅ | ✅ | ✅(권한 범위) | ❌ |

### 2.4 데이터 요구사항
- `class_schedules` 확장
  - `title`, `description`, `start_date`, `end_date`, `location`
  - `event_type` enum (field_trip, holiday, notice, workshop, etc.)
  - `audience_scope` enum (all, parents, staff)
  - `status` (draft/published/cancelled) + `cancellation_reason`
  - `notification_at`(optional) for reminder
- `class_schedule_targets` (다대다)
  - `schedule_id`, `classroom_id` (NULL → 전체)
  - 향후 `group_type`(A/B/C 그룹 등) 확장 가능
- `class_schedule_resources` (첨부 자료)
  - `schedule_id`, `file_url`, `label`

### 2.5 UX & 기술 고려사항
- **Calendar 컴포넌트**: 월/주/리스트 뷰 지원, 모바일 대응(세로 스크롤).  
- **필터링**: 자녀 반 자동 필터, 행사 유형 토글, 검색.  
- **반복 일정**: MVP에서는 수동 복제, 이후 반복 규칙 지원 여부 결정.  
- **알림**: 일정 생성/수정 시 부모 알림 큐(Phase 2).  
- **접근성**: 키보드 네비게이션, 스크린 리더-friendly label, 충분한 대비.

### 2.6 미해결 사항
- 반 그룹(A/B/C) 정의 방식 및 DB 상 구현(별도 테이블? 태그?). 교사-반 매핑 체계와 함께 설계.
- 외부 장소/지도 연동 필요 여부.  
- 일정 승인 워크플로(작성자-검수자) 도입 여부.

---

## 3. 급식 · 영양 모듈

### 3.1 목표
- 일/주/월 단위 식단 정보를 구조화해 검색 및 알레르기 정보 제공.
- PDF/JPG 통지서뿐 아니라 텍스트 데이터 제공으로 접근성 향상.
- 영양소식/급식 커뮤니케이션 자료를 다운로드와 미리보기로 제공.

### 3.2 사용자 흐름
- **관리자/영양사**
  1. `/admin/meals` → 월 선택 → 일자별 메뉴 입력(아침/점심/간식 등)  
  2. 알레르기 유발 식재료, 특별 안내, 첨부파일(PDF/이미지) 업로드  
  3. 영양소식지/공지 게시글 작성(카테고리 분리)  
  4. 게시/수정 후 학부모에게 알림 전송(옵션).
- **학부모**
  1. `/parents/meals` → 달력에서 오늘/주간 메뉴 확인  
  2. 알레르기 필터, 검색(예: “계란”)  
  3. 첨부 파일 다운로드, PDF 뷰어  
  4. 급식 관련 문의로 이동(CTA).

### 3.3 권한/접근 제어
| 기능 | Admin | Nutrition Manager | Parent | Guest |
| --- | --- | --- | --- | --- |
| 식단 CRUD | ✅ | ✅ | ❌ | ❌ |
| 영양 소식 게시 | ✅ | ✅ | ❌ | ❌ |
| 열람 | ✅ | ✅ | ✅ | (공개 범위에 따라) |
| 다운로드 | ✅ | ✅ | ✅ | 공개 시 |

> 영양사/급식 담당 전용 계정을 운영한다면 `users.role`에 `nutrition` 값을 추가한다.

### 3.4 데이터 요구사항
- `meal_plans` (신규)
  - `id`, `menu_date`, `meal_type`(breakfast/lunch/snack), `menu_items`(JSON array), `allergens`(array), `notes`, `audience_scope`
  - `calorie`, `nutrition_summary`(옵션)
- `meal_plan_resources`
  - `plan_id`, `file_url`, `label`, `media_type`
- `nutrition_bulletins` (영양소식 게시판)
  - `title`, `content`, `category`(bulletin/report/menu-plan), `publish_at`, `attachments`
- 감사필드: `created_by`, `updated_by`

### 3.5 UX & 기술 고려사항
- **달력 + 리스트**: 오늘/주간 메뉴 하이라이트, 모바일 드로어.  
- **검색/필터**: 식재료, 알레르기, meal type 필터.  
- **시각화**: 월간 요약, 알레르기 아이콘, PDF 뷰어(브라우저 embed).  
- **데이터 입력 편의**: CSV 업로드, 템플릿 복사, 지난 메뉴 불러오기.  
- **알림/연동**: 급식 변경 시 SMS/Push (추후), API 연동 대비.

### 3.6 미해결 사항
- 식단 데이터 외부 공급(교육청 등) 여부.  
- 다국어 제공 필요성.  
- 공휴일/급식 미실시일 처리 규칙.

### 3.7 퍼블릭 공개 체크리스트 (2025-10-29)
- [x] 퍼블릭 `/meals` 페이지에서 `audience_scope = 'all'` 항목만 노출하고, 학부모 포털은 `parents/all`을 포함하도록 분리.
- [x] 운영/스테이징 DB에 `meal_plan_audience_scope` enum(`all`) 마이그레이션 적용 확인 (`0005_phase2_core.sql`) — 로컬 Drizzle 메타(`drizzle/meta/0002_snapshot.json`) 및 시드 스크립트 갱신 완료, 운영 환경 확인은 배포 시 재점검.
- [x] 퍼블릭 식단 미등록 시 안내 문구(“등록된 급식 정보가 없습니다”) 노출 — 알림 채널(Slack/메일) 여부는 별도 결정 필요.
- [x] 첨부 URL 검증 규칙 공유: HTTPS, PDF/이미지 확장자, 구글 드라이브 화이트리스트 (`src/app/admin/meals/actions.ts`).
- [x] 공개 범위 변경 시(예: staff → all) 퍼블릭 페이지가 즉시 갱신되는지 QA 체크 — Server Action에서 `/parents/meals`, `/meals` revalidatePath 처리.
- [ ] 접근성 진단: 이미지 대체텍스트, 표 헤더, 키보드 포커스, 색 대비.
- [ ] 모바일(375px)에서 달력 스크롤 및 카드 레이아웃 깨짐 없는지 확인.

---

## 4. 공통/플랫폼 요구사항
- **역할 체계 확장**: `users.role`에 `teacher`, `nutrition` 값을 추가하고, 교사-반 매핑 구조(`classroom_teachers` 등)를 정의.  
- **권한 가드**: NextAuth Session + Middleware 로 `/admin` 하위 접근 통제, Parent Portal 필터링.  
- **알림 연동**: 향후 문자/이메일/푸시 확장 대비하여 이벤트 발행 구조 설계(예: queue table).  
- **감사 로그**: 주요 CRUD에 `created_by`, `updated_by`, `published_by` 저장.  
- **이미지/파일 저장소**: Vercel Blob, S3 등 선택, HTTPS URL 강제.  
- **성능/캐싱**: revalidateTag(`class-posts`, `schedules`, `meals`) 정의.  
- **i18n/accessibility**: 한글/영문 혼용 시 문구 전략, 스크린 리더 테스트 계획.

---

## 5. Phase 2 설계 (DB & API 초안)

### 5.1 스키마 변경 요약

| 영역 | 변경 내용 |
| --- | --- |
| **역할/사용자** | `user_role` enum에 `teacher`, `nutrition` 추가. |
| **교사-반 매핑** | `classroom_teachers` (신규) : `id`, `classroom_id` FK, `teacher_id` FK, `role`(lead/assistant), `assigned_at`, `created_at`. |
| **반 소식** | `class_posts`에 `status`(draft/published/archived), `audience_scope` enum(all, classroom, private), `published_at`, `published_by`, `updated_by`. `content`는 JSONB(`content_blocks`)로 확장 검토. |
|  | `class_post_media` (신규) : `post_id` FK, `file_url`, `thumbnail_url`, `media_type` enum(image, video), `alt_text`, `caption`, `display_order`, `is_cover`, `created_at`. |
|  | `class_post_tags` (옵션) : 태깅 필요 시 `post_id`, `tag`. |
| **학사 일정** | `class_schedules`에 `event_type` enum(field_trip, holiday, notice, workshop, etc.), `audience_scope` enum(all, parents, staff), `status` enum(draft, published, cancelled), `cancellation_reason`, `created_by`, `updated_by`. |
|  | `class_schedule_targets` (신규) : `schedule_id`, `classroom_id` 또는 `group_code`, `created_at`. |
|  | `class_schedule_resources` (신규) : `schedule_id`, `file_url`, `label`, `media_type`, `created_at`. |
| **급식/영양** | `meal_plans` (신규) : `id`, `menu_date`, `meal_type` enum(breakfast, lunch, snack, etc.), `menu_items` JSONB, `allergens` JSONB, `notes`, `audience_scope` enum(parents, staff), `created_by`, `updated_by`. |
|  | `meal_plan_resources` (신규) : `plan_id`, `file_url`, `label`, `media_type`, `created_at`. |
|  | `nutrition_bulletins` (신규) : `id`, `title`, `content`, `category` enum(bulletin, report, menu-plan), `publish_at`, `status`, `created_by`, `updated_by`. |
| **공통** | 모든 신규 테이블에 `created_at`, `updated_at` 기본 추가, 필요 시 soft-delete(`deleted_at`) 고려. |

> **그룹 관리**: `class_schedule_targets`의 `group_code` 필드는 (A/B/C 등) 사전 정의된 값 또는 별도 `classroom_groups` 테이블로 확장 가능. 초기에는 nullable string으로 시작하고, 요구 확정 시 정규화한다.

### 5.2 마이그레이션 체크리스트
1. `user_role` enum 확장 및 기존 데이터 영향 검토.
2. `class_posts` 구조 개편 시 기존 dummy 데이터 백업 → new column(`audience_scope`, `status`) 기본값 설정.
3. 신규 테이블 `classroom_teachers`, `class_post_media`, `class_schedule_targets`, `class_schedule_resources`, `meal_plans`, `meal_plan_resources`, `nutrition_bulletins` 생성.
4. 필요한 FK/인덱스 (`classroom_id`, `teacher_id`, `menu_date`, `schedule_id`) 정의.
5. Seed/테스트 데이터 업데이트: 교사/반 매핑, 예시 갤러리, 일정, 식단 데이터.
6. Drizzle 마이그레이션 파일 작성 후 로컬/CI 적용 테스트.

### 5.3 주요 Server Action & API 라우트

| 모듈 | Server Action / API | 설명 |
| --- | --- | --- |
| 공통 권한 | Middleware + `auth` helper | `/admin` 접근 시 role 검사, teacher는 자신의 반만 조회. |
| 반 관리 | `createClassroom`, `updateClassroom`, `assignTeacherToClassroom`, `removeTeacherFromClassroom` | 관리자 전용. |
| 교사 계정 | `createTeacherUser`, `resetTeacherPassword`, `deactivateTeacher` | 관리자 전용 user 관리 액션. |
| 반 소식 | `createClassPost`, `updateClassPost`, `publishClassPost`, `archiveClassPost`, `deleteClassPost` | 첨부 업로드/정렬 포함, teacher는 담당 반만 호출 가능. |
|  | GET `/api/class-posts` (필터: classroom, status) | Parent Portal/관리자 목록용. |
| 학사 일정 | `createSchedule`, `updateSchedule`, `cancelSchedule`, `deleteSchedule` | 대상 반 지정 + 첨부 관리. |
|  | GET `/api/schedules` (필터: date range, classroom/group, type) | Parent Portal 및 위젯용. |
| 급식/영양 | `createMealPlan`, `updateMealPlan`, `deleteMealPlan` | 일자/식단별 입력, 첨부 업로드. |
|  | `createNutritionBulletin`, `updateNutritionBulletin`, `deleteNutritionBulletin` | 영양소식 게시판 관리. |
|  | GET `/api/meals` (필터: date range, meal type, allergen) | Parent Portal 및 공개 페이지. |

> Server Action은 Next.js App Router 기반으로 `/admin` 폴더 내 Form + Action 패턴을 유지하고, API Route Handler는 `GET` 전용(SSR/CSR) 데이터 공급용으로 최소화한다. 중요 엔드포인트는 역할 기반 guard를 재확인한다.

### 5.4 향후 고려사항
- **파일 업로드**: 미디어/식단 첨부는 Vercel Blob 또는 S3에 업로드 후 URL 저장. 멀티파트 업로드 처리 유틸 필요.
- **이미지 처리**: `class_post_media` 표지/썸네일 생성을 위한 백그라운드 처리(Edge Function or 외부 서비스) 설계.
- **알림 큐**: 게시/일정/식단 변경 시 알림 발송을 위한 이벤트 테이블(`notification_jobs` 등) 추후 추가.
- **감사 로깅**: 관리 콘솔에서 주요 변경 이력을 볼 수 있도록 `activity_logs` 테이블을 도입할지 검토.

---

## 6. 다음 단계 (Phase 2 이후)
- 상세 기능 스토리 도출 → Jira/Linear 티켓화.
- DB 마이그레이션 초안 작성 및 리뷰.
- Wireframe/디자인 시스템 연계 작업.
- 통합적인 알림/로그 정책 수립.

> 이 문서는 1단계(요구 정리) 산출물이므로, 설계/구현 단계에서 변경 사항이 발생하면 AGENT.md 및 해당 섹션을 업데이트해야 한다.

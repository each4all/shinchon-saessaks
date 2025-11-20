import type { Metadata } from "next";

import { StoriesSidebar } from "@/components/stories/StoriesSidebar";
import { ClassNewsGallery } from "@/components/stories/class-news-gallery";
import { Badge } from "@/components/ui/badge";
import { ageStoryTabs } from "@/data/age-stories";
import { classStoryTabs } from "@/data/class-stories";
import { auth } from "@/lib/auth";
import { getClassPosts } from "@/lib/data/class-posts-repository";
import { buildGalleryTabs, mapPostsToGalleryCards } from "@/app/stories/shared/gallery-utils";

const classAllowedNames = new Set(classStoryTabs.map((tab) => tab.classroomName));
const ageAllowedNames = new Set(ageStoryTabs.map((tab) => tab.classroomName));

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "반별 교육활동 미리보기 | 신촌몬테소리유치원",
  description:
    "학부모와 교직원을 위한 반별 교육활동 게시판 요약 페이지입니다. 로그인 후 사진과 상세 기록을 확인하세요.",
};

type ClassNewsPageProps = {
  searchParams: Promise<{ login?: string }>;
};

export default async function ClassNewsPage({ searchParams }: ClassNewsPageProps) {
  const params = await searchParams;
  const openLogin = params?.login === "1";

  const session = await auth();
  const userRole = session?.user?.role;
  const userStatus = session?.user?.status;
  const userId = session?.user?.id;

  const isAuthenticated = Boolean(userId);
  const isParentActive = userRole === "parent" && userStatus === "active";
  const isParentPending = userRole === "parent" && userStatus !== "active";
  const isStaff = userRole === "admin" || userRole === "teacher";
  const canViewGallery = Boolean(isParentActive || isStaff);

  let galleryPosts = [];
  if (canViewGallery) {
    galleryPosts = await getClassPosts({ includeDrafts: false, limit: 120 });
  }

  const classGalleryCards = canViewGallery ? mapPostsToGalleryCards(galleryPosts, classAllowedNames) : [];
  const classGalleryTabs = buildGalleryTabs(classGalleryCards, classStoryTabs);
  const defaultClassTab =
    classGalleryTabs.find((tab) => tab.posts.length > 0)?.key ?? classGalleryTabs[0]?.key ?? classStoryTabs[0]?.key ?? "gaenari";

  const ageGalleryCards = canViewGallery ? mapPostsToGalleryCards(galleryPosts, ageAllowedNames) : [];
  const ageGalleryTabs = buildGalleryTabs(ageGalleryCards, ageStoryTabs);
  const defaultAgeTab =
    ageGalleryTabs.find((tab) => tab.posts.length > 0)?.key ?? ageGalleryTabs[0]?.key ?? ageStoryTabs[0]?.key ?? "age-a";

  return (
    <div className="bg-[var(--background)] text-[var(--brand-navy)]">
      <section className="border-b border-[var(--border)] bg-white/85">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
          <Badge variant="outline" className="w-fit">
            우리들 이야기
          </Badge>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3rem)] leading-tight">반별 교육활동 미리보기</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            학교 생활을 빠르게 확인할 수 있는 스냅샷 공간입니다. 승인된 보호자 또는 교직원이 로그인하면 자세한 사진과 활동 노트를 볼
            수 있습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-12">
        <div className="hidden lg:block">
          <StoriesSidebar />
        </div>
        <div className="space-y-10">
          <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 px-6 py-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-[var(--brand-primary)]">Gallery</span>
                <span>반별 스냅샷</span>
              </div>
              <h2 className="font-heading text-[clamp(1.8rem,3vw,2.4rem)] text-[var(--brand-navy)]">교실 안팎의 작은 순간들</h2>
              <p className="text-sm text-muted-foreground">
                가족 운동회, 교실 프로젝트, 계절 체험 등 반별 활동을 최신 순으로 모았습니다. 카드 클릭 시 원본 전체 사진을 볼 수 있어요.
              </p>
            </div>

            <ClassNewsGallery
              tabs={classGalleryTabs}
              defaultTab={defaultClassTab}
              isAuthenticated={isAuthenticated}
              canViewGallery={canViewGallery}
              isPendingParent={isParentPending}
              defaultLoginOpen={openLogin && !isAuthenticated}
              loginRedirectPath="/stories/class-news"
            />
          </section>

          <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 px-6 py-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span className="rounded-full bg-[var(--brand-secondary)]/15 px-3 py-1 text-[var(--brand-secondary)]">Gallery</span>
                <span>연령별 교육활동</span>
              </div>
              <h2 className="font-heading text-[clamp(1.8rem,3vw,2.4rem)] text-[var(--brand-navy)]">연령 그룹 앨범</h2>
              <p className="text-sm text-muted-foreground">
                A/B/C 그룹별 프로젝트, 문화 체험, 졸업 준비 활동을 최신 순으로 모았습니다. 카드에서 원본 사진을 이어서 살펴보세요.
              </p>
            </div>

            <ClassNewsGallery
              tabs={ageGalleryTabs}
              defaultTab={defaultAgeTab}
              isAuthenticated={isAuthenticated}
              canViewGallery={canViewGallery}
              isPendingParent={isParentPending}
              defaultLoginOpen={openLogin && !isAuthenticated}
              loginRedirectPath="/stories/class-news"
            />
          </section>
        </div>
      </section>
    </div>
  );
}

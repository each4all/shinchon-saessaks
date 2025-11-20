import type { Metadata } from "next";

import { StoriesSidebar } from "@/components/stories/StoriesSidebar";
import { ClassNewsGallery } from "@/components/stories/class-news-gallery";
import { Badge } from "@/components/ui/badge";
import { ageStoryTabs } from "@/data/age-stories";
import { auth } from "@/lib/auth";
import { getClassPosts } from "@/lib/data/class-posts-repository";
import { mapPostsToGalleryCards, buildGalleryTabs } from "@/app/stories/shared/gallery-utils";

const allowedNames = new Set(ageStoryTabs.map((tab) => tab.classroomName));

export const metadata: Metadata = {
  title: "연령별 교육활동 | 신촌몬테소리유치원",
  description: "A/B/C 그룹별 프로젝트와 체험 사진을 모았어요. 로그인 후 따뜻한 순간을 함께 보세요.",
};

export const dynamic = "force-dynamic";

type AgeNewsPageProps = {
  searchParams: Promise<{ login?: string }>;
};

export default async function AgeNewsPage({ searchParams }: AgeNewsPageProps) {
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

  const posts = canViewGallery ? await getClassPosts({ includeDrafts: false, limit: 120 }) : [];
  const galleryCards = canViewGallery ? mapPostsToGalleryCards(posts, allowedNames) : [];
  const galleryTabs = buildGalleryTabs(galleryCards, ageStoryTabs);
  const defaultTab =
    galleryTabs.find((tab) => tab.posts.length > 0)?.key ?? galleryTabs[0]?.key ?? ageStoryTabs[0]?.key ?? "age-a";

  return (
    <div className="bg-[var(--background)] text-[var(--brand-navy)]">
      <section className="border-b border-[var(--border)] bg-white/85">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
          <Badge variant="outline" className="w-fit">
            우리들 이야기
          </Badge>
          <h1 className="font-heading text-[clamp(2.25rem,4vw,3rem)] leading-tight">연령별 교육활동</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            연령별로 맞춤화된 프로젝트와 체험 학습 소식을 모았습니다. 로그인 후 각 카드에서 더 많은 사진과 활동 노트를 확인할 수
            있습니다.
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
                <span className="rounded-full bg-[var(--brand-secondary)]/15 px-3 py-1 text-[var(--brand-secondary)]">Gallery</span>
                <span>연령 그룹 앨범</span>
              </div>
              <h2 className="font-heading text-[clamp(1.8rem,3vw,2.4rem)] text-[var(--brand-navy)]">함께 성장하는 A/B/C 그룹</h2>
              <p className="text-sm text-muted-foreground">
                연령별 맞춤 프로젝트, 문화 체험, 졸업 준비 활동을 최신 순으로 모았습니다. 카드에서 원본 전체 이미지를 확인할 수 있습니다.
              </p>
            </div>

            <ClassNewsGallery
              tabs={galleryTabs}
              defaultTab={defaultTab}
              isAuthenticated={isAuthenticated}
              canViewGallery={canViewGallery}
              isPendingParent={isParentPending}
              defaultLoginOpen={openLogin && !isAuthenticated}
              loginRedirectPath="/stories/age-news"
            />
          </section>
        </div>
      </section>
    </div>
  );
}

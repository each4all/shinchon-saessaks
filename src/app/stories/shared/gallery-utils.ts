import type { ClassPost } from "@/lib/data/class-posts-repository";
import type { ClassNewsGalleryPost, ClassNewsGalleryTab } from "@/components/stories/class-news-gallery";

export type GalleryCard = ClassNewsGalleryPost;
export type GalleryAttachment = GalleryCard["attachments"][number];

export function mapPostsToGalleryCards(posts: ClassPost[], allowedNames: Set<string>): GalleryCard[] {
  return posts
    .map((post) => {
      const normalizedName = post.classroomName?.trim();
      if (!normalizedName || !allowedNames.has(normalizedName)) {
        return null;
      }
      const attachments: GalleryAttachment[] = post.attachments
        .filter((attachment) => Boolean(attachment.fileUrl))
        .map((attachment, index) => ({
          id: attachment.id ?? `${post.id}-${index}`,
          previewUrl: attachment.thumbnailUrl ?? attachment.fileUrl,
          fullUrl: attachment.fileUrl,
          caption: attachment.caption ?? undefined,
          alt: attachment.altText ?? attachment.caption ?? post.title,
        }));

      if (!attachments.length) {
        return null;
      }

      return {
        id: post.id,
        title: post.title,
        summary: pickSummary(post),
        classroomName: normalizedName,
        dateText: formatPostDate(post),
        attachments,
      } satisfies GalleryCard;
    })
    .filter((card): card is GalleryCard => Boolean(card));
}

export function buildGalleryTabs(
  cards: GalleryCard[],
  baseTabs: { key: string; label: string; classroomName: string }[],
): ClassNewsGalleryTab[] {
  const MAX_ITEMS_PER_TAB = 12;
  const cardsByClass = new Map<string, GalleryCard[]>();

  for (const card of cards) {
    const className = card.classroomName?.trim().length ? card.classroomName.trim() : "미지정 그룹";
    if (!cardsByClass.has(className)) {
      cardsByClass.set(className, []);
    }
    cardsByClass.get(className)!.push(card);
  }

  return baseTabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    posts: (cardsByClass.get(tab.classroomName) ?? []).slice(0, MAX_ITEMS_PER_TAB),
  }));
}

export function formatPostDate(post: ClassPost) {
  const date = post.publishedAt ?? post.publishAt ?? post.createdAt;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function pickSummary(post: ClassPost) {
  const summary = post.summary?.trim();
  if (summary) return summary;

  const firstParagraph = post.content.find((paragraph) => paragraph.trim().length);
  return firstParagraph?.trim();
}

import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { getPublicClassPostPreviews } from "@/lib/data/class-posts-repository";

import { ClassNewsPublicTable } from "./_components/class-news-public-table";

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

	const previews = await getPublicClassPostPreviews(12);

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<Badge variant="outline" className="w-fit">
						우리들 이야기
					</Badge>
					<h1 className="font-heading text-[clamp(2.25rem,4vw,3rem)] leading-tight">
						반별 교육활동 미리보기
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">
						아이들의 하루와 특별 활동을 간략히 살펴볼 수 있는 미리보기 공간입니다. 안전한 운영을 위해 사진과 첨부 자료는
						로그인한 학부모와 교직원에게만 공개됩니다.
					</p>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-12">
				<ClassNewsPublicTable
					items={previews}
					defaultLoginOpen={openLogin}
					redirectPath="/parents/posts"
				/>
			</section>
		</div>
	);
}

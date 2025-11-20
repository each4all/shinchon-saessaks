"use client";

import { SectionSidebar } from "@/components/navigation/SectionSidebar";

const storiesNav = [
	{ label: "반별 교육활동", href: "/stories/class-news" },
	{ label: "연령별 교육활동", href: "/stories/age-news" },
	{ label: "교육행사", href: "/stories/events" },
];

type StoriesSidebarProps = {
	title?: string;
};

export function StoriesSidebar({ title = "우리들 이야기" }: StoriesSidebarProps) {
	return (
		<SectionSidebar
			title={title}
			sections={[{ links: storiesNav }]}
			titleClassName="tracking-[0.3em]"
		/>
	);
}

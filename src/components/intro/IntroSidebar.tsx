"use client";

import { SectionSidebar } from "@/components/navigation/SectionSidebar";

const introGreetingNav = [
	{ label: "이사장", href: "/intro/greeting?tab=chair" },
	{ label: "원장", href: "/intro/greeting?tab=principal" },
	{ label: "교사", href: "/intro/greeting?tab=teachers" },
];

const introNav = [
	{ label: "연혁", href: "/intro/history" },
	{ label: "원훈", href: "/intro/ideology" },
	{ label: "본원의 특색", href: "/intro/special" },
	{ label: "입학안내", href: "/intro/admissions" },
	{ label: "찾아오시는 길", href: "/intro/map" },
];

export function IntroSidebar({ className, stickyOffset }: { className?: string; stickyOffset?: number }) {
	const sections = [
		{
			heading: "인사말",
			links: introGreetingNav.map((item) => ({
				...item,
				isActive: ({ pathname, searchParams }) => {
					if (!pathname || !searchParams) return false;
					if (pathname !== "/intro/greeting") return false;
					const tab = searchParams.get("tab") ?? "chair";
					const targetTab = new URL(item.href, "https://example.local").searchParams.get("tab") ?? "chair";
					return tab === targetTab;
				},
			})),
		},
		{
			links: introNav,
		},
	];

	return <SectionSidebar title="유치원 소개" sections={sections} className={className} stickyOffset={stickyOffset} />;
}

"use client";

import { SectionSidebar } from "@/components/navigation/SectionSidebar";

const curriculumNav = [
	{ label: "하루일과", href: "/education/daily-schedule" },
	{ label: "몬테소리 교육", href: "/education/montessori" },
	{ label: "기독교 유아교육", href: "/education/christian-education" },
	{ label: "생태 유아교육", href: "/education/eco-education" },
	{ label: "부모교육", href: "/education/parent-education" },
];

export function CurriculumSidebar({ stickyOffset }: { stickyOffset?: number }) {
	return <SectionSidebar title="교육과정" sections={[{ links: curriculumNav }]} stickyOffset={stickyOffset} />;
}

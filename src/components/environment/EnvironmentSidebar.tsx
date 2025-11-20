"use client";

import { SectionSidebar } from "@/components/navigation/SectionSidebar";

const environmentNav = [
	{ label: "실내", href: "/environment/interior" },
	{ label: "실외", href: "/environment/outside" },
];

export function EnvironmentSidebar({ stickyOffset }: { stickyOffset?: number }) {
	return <SectionSidebar title="교육환경" sections={[{ links: environmentNav }]} stickyOffset={stickyOffset} />;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	buildSidebarLinkClass,
	sidebarCardClass,
	sidebarSectionHeadingClass,
} from "@/components/intro/IntroSidebar";

const curriculumNav = [
	{ label: "하루일과", href: "/education/daily-schedule" },
	{ label: "몬테소리 교육", href: "/education/montessori" },
	{ label: "기독교 유아교육", href: "/education/christian-education" },
	{ label: "생태 유아교육", href: "/education/eco-education" },
	{ label: "부모교육", href: "/education/parent-education" },
];

function resolvePathname(href: string) {
	try {
		const url = new URL(href, "https://example.local");
		return url.pathname;
	} catch {
		return href.split("#")[0] ?? href;
	}
}

export function CurriculumSidebar() {
	const pathname = usePathname();
	const isActive = (href: string) => {
		const target = resolvePathname(href);
		if (!target) return false;
		return pathname === target || pathname?.startsWith(`${target}/`);
	};

	return (
		<aside className={sidebarCardClass}>
			<p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">교육과정</p>
			<ul className="mt-4 space-y-1">
				{curriculumNav.map((item) => (
					<li key={item.label}>
						<Link href={item.href} className={buildSidebarLinkClass(isActive(item.href))}>
							{item.label}
						</Link>
					</li>
				))}
			</ul>
		</aside>
	);
}

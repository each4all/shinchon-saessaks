"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const storiesNav = [
	{ label: "반별 교육활동", href: "/stories/class-news" },
	{ label: "연령별 교육활동", href: "/stories/age-news" },
	{ label: "교육행사", href: "/stories/events" },
];

type StoriesSidebarProps = {
	title?: string;
};

export function StoriesSidebar({ title = "우리들 이야기" }: StoriesSidebarProps) {
	const pathname = usePathname();

	return (
		<aside className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]">
			<p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
			<ul className="mt-4 space-y-1">
				{storiesNav.map((item) => {
					const isActive = pathname === item.href;
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								className={cn(
									"block rounded-[var(--radius-sm)] px-3 py-2 text-sm transition hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)]",
									isActive ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]" : "text-[var(--brand-navy)]",
								)}
								aria-current={isActive ? "page" : undefined}
							>
								{item.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</aside>
	);
}

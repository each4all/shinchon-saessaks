"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type ActiveContext = {
	pathname: string | null;
	searchParams: URLSearchParams | Readonly<URLSearchParams> | null;
};

export type SidebarLink = {
	label: string;
	href: string;
	isActive?: (ctx: ActiveContext) => boolean;
};

export type SidebarSection = {
	heading?: string;
	links: SidebarLink[];
};

type SectionSidebarProps = {
	title: string;
	sections: SidebarSection[];
	className?: string;
	titleClassName?: string;
	stickyOffset?: number;
};

const sidebarCardClass =
	"self-start rounded-[0.65rem] border border-[var(--border)] bg-white/90 px-5 py-6 shadow-[var(--shadow-soft)]";
const titleClassBase = "text-xs font-semibold uppercase text-muted-foreground";
const sidebarLinkBaseClass =
	"flex items-center rounded-[0.4rem] px-3 py-2 text-sm font-medium transition";

function resolvePathname(href: string) {
	try {
		const url = new URL(href, "https://example.local");
		return url.pathname;
	} catch {
		return href.split("#")[0] ?? href;
	}
}

function defaultIsActive(href: string, pathname: string | null) {
	const target = resolvePathname(href);
	if (!target || !pathname) return false;
	return pathname === target || pathname.startsWith(`${target}/`);
}

export function SectionSidebar({
	title,
	sections,
	className,
	titleClassName = "tracking-[0.22em]",
	stickyOffset = 112,
}: SectionSidebarProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const stickyClass = stickyOffset !== undefined ? "sticky" : undefined;
	const stickyStyle: CSSProperties | undefined =
		stickyOffset !== undefined ? { top: stickyOffset } : undefined;

	return (
		<aside className={cn(sidebarCardClass, stickyClass, className)} style={stickyStyle}>
			<p className={cn(titleClassBase, titleClassName)}>{title}</p>
			<div className="mt-4 space-y-5">
				{sections.map((section, idx) => (
					<section key={section.heading ?? idx} className="space-y-2">
						{section.heading ? (
							<p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
								{section.heading}
							</p>
						) : null}
						<ul className="space-y-1">
							{section.links.map((item) => {
								const active = item.isActive
									? item.isActive({ pathname, searchParams })
									: defaultIsActive(item.href, pathname);
								return (
									<li key={item.href}>
										<Link
											href={item.href}
											className={cn(
												sidebarLinkBaseClass,
												active
													? "bg-[var(--brand-primary)]/12 text-[var(--brand-primary)]"
													: "text-[var(--brand-navy)] hover:bg-[var(--surface,rgba(248,248,252,0.9))] hover:text-[var(--brand-primary)]",
											)}
											aria-current={active ? "page" : undefined}
										>
											{item.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</section>
				))}
			</div>
		</aside>
	);
}

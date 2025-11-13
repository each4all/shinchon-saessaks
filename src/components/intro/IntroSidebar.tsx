"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

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

export const sidebarCardClass =
    "self-start rounded-[0.65rem] border border-[var(--border)] bg-white/90 px-5 py-6 shadow-[var(--shadow-soft)]";
export const sidebarSectionHeadingClass = "text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground";
export const sidebarLinkBaseClass =
    "flex items-center rounded-[0.4rem] px-3 py-2 text-sm font-medium transition";

export function buildSidebarLinkClass(active: boolean) {
    return cn(
        sidebarLinkBaseClass,
        active
            ? "bg-[var(--brand-primary)]/12 text-[var(--brand-primary)]"
            : "text-[var(--brand-navy)] hover:bg-[var(--surface,rgba(248,248,252,0.9))] hover:text-[var(--brand-primary)]",
    );
}

export function IntroSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentGreetingTab = pathname === "/intro/greeting" ? searchParams?.get("tab") ?? "chair" : null;

    const isGreetingActive = (href: string) => {
        try {
            const url = new URL(href, "https://example.local");
            if (url.pathname !== "/intro/greeting") {
                return pathname === url.pathname;
            }
            const tab = url.searchParams.get("tab") ?? "chair";
            return pathname === "/intro/greeting" && tab === currentGreetingTab;
        } catch {
            return false;
        }
    };

    const isIntroActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <aside className={cn(sidebarCardClass, className)}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">유치원 소개</p>
            <div className="mt-4 space-y-5">
                <section className="space-y-2">
                    <p className={sidebarSectionHeadingClass}>인사말</p>
                    <ul className="space-y-1">
                        {introGreetingNav.map((item) => (
                            <li key={item.label}>
                                <Link href={item.href} className={buildSidebarLinkClass(isGreetingActive(item.href))}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="space-y-2">
                    <p className={sidebarSectionHeadingClass}>소개</p>
                    <ul className="space-y-1">
                        {introNav.map((item) => (
                            <li key={item.label}>
                                <Link href={item.href} className={buildSidebarLinkClass(isIntroActive(item.href))}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </aside>
    );
}

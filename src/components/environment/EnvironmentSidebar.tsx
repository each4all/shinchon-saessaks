"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buildSidebarLinkClass, sidebarCardClass, sidebarSectionHeadingClass } from "@/components/intro/IntroSidebar";

const environmentNav = [
    { label: "실내", href: "/environment/interior" },
    { label: "실외", href: "/environment/outside" },
];

export function EnvironmentSidebar() {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <aside className={sidebarCardClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">교육환경</p>
            <div className="mt-4 space-y-2">
                <p className={sidebarSectionHeadingClass}>공간 안내</p>
                <ul className="space-y-1">
                    {environmentNav.map((item) => (
                        <li key={item.label}>
                            <Link href={item.href} className={buildSidebarLinkClass(isActive(item.href))}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

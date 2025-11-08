import Link from "next/link";

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

export function IntroSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "self-start rounded-[var(--radius-lg)] border border-[var(--brand-primary)]/20 bg-[var(--brand-mint)]/15 p-4 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <p className="text-sm font-semibold text-[var(--brand-navy)]">유치원 소개</p>
      <div className="mt-4 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">인사말</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--brand-navy)]">
            {introGreetingNav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 font-medium transition hover:bg-white/70 hover:text-[var(--brand-primary)]"
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">소개 메뉴</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--brand-navy)]">
            {introNav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 font-medium transition hover:bg-white/70 hover:text-[var(--brand-primary)]"
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

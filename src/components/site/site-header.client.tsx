"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowRight, LogIn, LogOut, Menu, X } from "lucide-react";
import type { Session } from "next-auth";

import { Button } from "@/components/ui/button";

const navItems = [
	{ href: "/#about", label: "유치원 소개" },
	{ href: "/#programs", label: "교육 프로그램" },
	{ href: "/#admissions", label: "입학 안내" },
	{ href: "/news", label: "알림마당" },
	{ href: "/#visit", label: "오시는 길" },
];

type SiteHeaderClientProps = {
	initialSession: Session | null;
};

type CtaButton = {
	key: string;
	label: string;
	href: string;
	variant: "default" | "outline" | "secondary";
	className?: string;
};

export function SiteHeaderClient({ initialSession }: SiteHeaderClientProps) {
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const pathname = usePathname();
	const { data: clientSession, status } = useSession();
	const session = status === "loading" ? initialSession : clientSession ?? initialSession;
	const isAdmin = session?.user?.role === "admin";
	const isAuthenticated = Boolean(session?.user?.id);
	const isAdminRoute = pathname?.startsWith("/admin") ?? false;
	const isParentsRoute = pathname?.startsWith("/parents") ?? false;
	const userStatus = session?.user?.status;

	useEffect(() => {
		document.body.style.overflow = isMobileNavOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileNavOpen]);

	const closeMobileNav = () => setIsMobileNavOpen(false);

	const handleSignOut = useCallback(() => {
		setIsMobileNavOpen(false);
		void signOut({ callbackUrl: "/member/login" });
	}, []);

	const makeAdminConsoleCta = (variant: CtaButton["variant"]): CtaButton => ({
		key: "admin-console",
		label: "관리자 콘솔",
		href: "/admin",
		variant,
	});

	const makeParentsPortalCta = (variant: CtaButton["variant"], href = "/parents"): CtaButton => ({
		key: "parents-portal",
		label: "학부모 포털",
		href,
		variant,
		className:
			"border-[var(--brand-secondary)] text-[var(--brand-secondary)] hover:bg-[var(--brand-secondary)]/10",
	});

	const desktopCtas: CtaButton[] = useMemo(() => {
		const items: CtaButton[] = [
			{ key: "admissions", label: "입학 상담 예약", href: "/#admissions", variant: "default" },
		];

		if (isAdmin) {
			if (isAdminRoute) {
				items.push(makeParentsPortalCta("outline"));
			} else if (isParentsRoute) {
				items.push(makeAdminConsoleCta("default"));
			} else {
				items.push(makeAdminConsoleCta("default"));
			}
		} else if (isAuthenticated) {
			if (userStatus === "active") {
				items.push(makeParentsPortalCta("outline"));
			} else if (userStatus === "pending") {
				items.push(makeParentsPortalCta("outline", "/parents/pending"));
			}
		}

		return items;
	}, [isAdmin, isAdminRoute, isParentsRoute, isAuthenticated, userStatus]);

	const mobileCtas: CtaButton[] = useMemo(() => {
		const items: CtaButton[] = [
			{ key: "admissions", label: "입학 상담 예약", href: "/#admissions", variant: "default" },
		];

		if (isAdmin) {
			if (isAdminRoute) {
				items.push(makeParentsPortalCta("outline"));
			} else if (isParentsRoute) {
				items.push(makeAdminConsoleCta("default"));
			} else {
				items.push(makeAdminConsoleCta("default"));
			}
		} else if (isAuthenticated) {
			if (userStatus === "active") {
				items.push(makeParentsPortalCta("outline"));
			} else if (userStatus === "pending") {
				items.push(makeParentsPortalCta("outline", "/parents/pending"));
			}
		}

		items.push({ key: "programs", label: "교육 프로그램 보기", href: "/#programs", variant: "secondary" });

		return items;
	}, [isAdmin, isAdminRoute, isParentsRoute, isAuthenticated, userStatus]);

	const authAction = useMemo(() => {
		if (isAuthenticated) {
			return {
				type: "logout" as const,
				label: "로그아웃",
			};
		}

		return {
			type: "login" as const,
			label: "로그인",
			href: "/member/login",
		};
	}, [isAuthenticated]);

	return (
		<header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/85 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
				<Link href="/" className="flex flex-col">
					<span className="font-heading text-lg font-semibold text-[var(--brand-primary)]">
						신촌몬테소리유치원
					</span>
					<span className="text-xs text-muted-foreground">Shinchon Montessori Kindergarten</span>
				</Link>

				<nav className="hidden items-center gap-6 text-sm font-medium text-[var(--brand-navy)] md:flex">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="transition hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
						>
							{item.label}
						</Link>
					))}
				</nav>

					<div className="hidden items-center gap-2 md:flex">
						{authAction.type === "login" ? (
							<Button
								variant="outline"
								size="sm"
								className="inline-flex items-center gap-1 border-[var(--border)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
								asChild
							>
								<Link href={authAction.href}>
									<LogIn className="size-4" />
									{authAction.label}
								</Link>
							</Button>
						) : (
							<Button
								variant="outline"
								size="sm"
								className="inline-flex items-center gap-1 border-[var(--border)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
								onClick={handleSignOut}
							>
								<LogOut className="size-4" />
								{authAction.label}
							</Button>
						)}

						{desktopCtas.map((cta) => (
							<Button
								key={cta.key}
								variant={cta.variant}
							size="sm"
							className={cta.className}
							asChild
						>
							<Link href={cta.href}>{cta.label}</Link>
						</Button>
					))}
				</div>

				<button
					type="button"
					className="inline-flex items-center justify-center rounded-full border border-[var(--border)] p-2 text-[var(--brand-navy)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 md:hidden"
					onClick={() => setIsMobileNavOpen(true)}
					aria-label="모바일 메뉴 열기"
				>
					<Menu className="size-5" />
				</button>
			</div>

			{isMobileNavOpen ? (
				<div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm md:hidden">
					<div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
						<span className="font-heading text-lg text-[var(--brand-navy)]">신촌몬테소리유치원</span>
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-full border border-[var(--border)] p-2 text-[var(--brand-navy)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
							onClick={closeMobileNav}
							aria-label="모바일 메뉴 닫기"
						>
							<X className="size-5" />
						</button>
					</div>

					<nav className="flex flex-col gap-6 px-6 py-6 text-base font-medium text-[var(--brand-navy)]">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="rounded-[var(--radius-md)] bg-[var(--brand-mint)]/25 px-4 py-3 transition hover:bg-[var(--brand-mint)]/40"
								onClick={closeMobileNav}
							>
								{item.label}
							</Link>
						))}

							<div className="mt-2 border-t border-[var(--border)] pt-6 text-sm text-muted-foreground">
								<p className="mb-3 font-semibold text-[var(--brand-navy)]">빠른 연결</p>
								<div className="flex flex-col gap-3">
									{authAction.type === "login" ? (
										<Button
											variant="outline"
											size="sm"
											className="justify-center gap-2 border-[var(--border)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
											asChild
										>
											<Link href={authAction.href} onClick={closeMobileNav}>
												<LogIn className="size-4" />
												{authAction.label}
											</Link>
										</Button>
									) : (
										<Button
											variant="outline"
											size="sm"
											className="inline-flex justify-center gap-2 border-[var(--border)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
											onClick={handleSignOut}
										>
											<LogOut className="size-4" />
											{authAction.label}
										</Button>
									)}
								</div>
							</div>
						</nav>

					<div className="flex flex-col gap-3 border-t border-[var(--border)] px-6 py-6">
						{mobileCtas.map((cta) => (
							<Button
								key={cta.key}
								size="lg"
								variant={cta.variant}
								className={cta.className}
								asChild
							>
								<Link href={cta.href} onClick={closeMobileNav}>
									{cta.label}
									{cta.key === "admissions" ? <ArrowRight className="ml-2 size-4" /> : null}
								</Link>
							</Button>
						))}
					</div>
				</div>
			) : null}
		</header>
	);
}

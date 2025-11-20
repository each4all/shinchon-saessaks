"use client";

import Image from "next/image";
import Link from "next/link";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FocusEvent,
} from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
	ArrowRight,
	ChevronDown,
	ChevronRight,
	LogIn,
	LogOut,
	Menu,
	X,
} from "lucide-react";
import type { Session } from "next-auth";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
	label: string;
	href?: string;
	children?: NavItem[];
};

const navTree: NavItem[] = [
	{
		label: "유치원 소개",
		href: "/intro/greeting?tab=chair",
		children: [
			{
				label: "인사말",
				href: "/intro/greeting?tab=chair",
				children: [
					{ label: "이사장", href: "/intro/greeting?tab=chair" },
					{ label: "원장", href: "/intro/greeting?tab=principal" },
					{ label: "교사", href: "/intro/greeting?tab=teachers" },
				],
			},
			{ label: "연혁", href: "/intro/history" },
			{ label: "원훈", href: "/intro/ideology" },
			{ label: "본원의 특색", href: "/intro/special" },
			{ label: "입학안내", href: "/intro/admissions" },
			{ label: "찾아오시는 길", href: "/intro/map" },
		],
	},
	{
		label: "교육환경",
		href: "/environment/interior",
		children: [
			{ label: "실내", href: "/environment/interior" },
			{ label: "실외", href: "/environment/outside" },
		],
	},
	{
		label: "교육과정",
		href: "/education/daily-schedule",
		children: [
			{ label: "하루일과", href: "/education/daily-schedule" },
			{ label: "몬테소리 교육", href: "/education/montessori" },
			{ label: "기독교 유아교육", href: "/education/christian-education" },
			{ label: "생태 유아교육", href: "/education/eco-education" },
			{ label: "부모교육", href: "/education/parent-education" },
		],
	},
	{
		label: "우리들 이야기",
		href: "/stories/class-news",
		children: [
			{ label: "반별 교육활동", href: "/stories/class-news" },
			{ label: "연령별 교육활동", href: "/stories/age-news" },
			{ label: "교육행사", href: "/stories/events" },
		],
	},
	{
		label: "신촌소식",
		href: "/news",
		children: [
			{ label: "공지사항", href: "/news/announcements" },
			{ label: "가정통신문", href: "/news/newsletter" },
			{ label: "월별행사안내", href: "/news/events" },
			{
				label: "급식게시판",
				href: "/meals",
				children: [
					{ label: "오늘의 식단", href: "/meals" },
					{ label: "급식소통함", href: "/parents/meals" },
				],
			},
			{ label: "각종서식", href: "/parents/resources" },
			{ label: "유치원 운영 위원회", href: "/parents/resources?section=committee" },
		],
	},
];

function isActivePath(currentPath: string | null, href?: string) {
	if (!href || !currentPath) return false;
	try {
		const target = new URL(href, "https://example.local");
		const normalize = (path: string) => (path === "/" ? "/" : path.replace(/\/$/, ""));
		const normalizedCurrent = normalize(currentPath);
		const targetPath = normalize(target.pathname);
		return (
			normalizedCurrent === targetPath || normalizedCurrent.startsWith(`${targetPath}/`)
		);
	} catch {
		return false;
	}
}

const themePresets = [
	{ key: "default", label: "기본", className: null as string | null },
	{ key: "coral", label: "코랄", className: "theme-coral" },
	{ key: "berry", label: "베리", className: "theme-berry" },
	{ key: "tangerine", label: "탠저린", className: "theme-tangerine" },
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

function DesktopSubmenu({ items }: { items: NavItem[] }) {
	return (
		<div
			data-submenu
			className="inline-flex w-fit max-w-[min(360px,92vw)] flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white/95 px-4 py-4 shadow-2xl"
		>
			{items.map((item) => (
				<div key={item.label} className="flex flex-col gap-1">
					<Link
						href={item.href ?? "#"}
						className="inline-flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-sm font-semibold text-[var(--brand-navy)] transition hover:bg-[var(--brand-mint)]/20 hover:text-[var(--brand-primary)]"
					>
						<span className="truncate">{item.label}</span>
						{item.children?.length ? <ChevronRight className="size-3.5 text-muted-foreground" /> : null}
					</Link>
					{item.children?.length ? (
						<ul className="relative flex flex-col gap-1 pl-4 text-[13px] text-muted-foreground">
							<span aria-hidden className="absolute left-1 top-2 bottom-1 w-px bg-[var(--border)]" />
							{item.children.map((child) => (
								<li key={`${item.label}>${child.label}`} className="relative pl-3">
									<span aria-hidden className="absolute left-0 top-3 size-1.5 rounded-full bg-[var(--brand-secondary)]" />
									<Link
										href={child.href ?? "#"}
										className="block whitespace-nowrap rounded-[var(--radius-sm)] px-2 py-1 transition hover:bg-[var(--brand-mint)]/30 hover:text-[var(--brand-primary)]"
									>
										{child.label}
									</Link>
								</li>
							))}
						</ul>
					) : null}
				</div>
			))}
		</div>
	);
}

export function SiteHeaderClient({ initialSession }: SiteHeaderClientProps) {
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const [openMenu, setOpenMenu] = useState<string | null>(null);
	const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
	const [activeTheme, setActiveTheme] = useState<string>(() => {
		if (typeof document === "undefined") {
			return "default";
		}
		const root = document.documentElement;
		const detected = themePresets.find((preset) => preset.className && root.classList.contains(preset.className));
		return detected?.key ?? "default";
	});
	const closeMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const cancelPendingClose = useCallback(() => {
		if (closeMenuTimerRef.current) {
			clearTimeout(closeMenuTimerRef.current);
			closeMenuTimerRef.current = null;
		}
	}, []);

	const scheduleCloseMenu = useCallback(
		(label: string) => {
			cancelPendingClose();
			closeMenuTimerRef.current = setTimeout(() => {
				setOpenMenu((current) => (current === label ? null : current));
			}, 180);
		},
		[cancelPendingClose],
	);

	const pathname = usePathname();
	const { data: clientSession, status } = useSession();
	const hasServerSession = Boolean(initialSession?.user?.id);
	const session =
		status === "authenticated"
			? clientSession
			: status === "loading" && hasServerSession
				? initialSession
				: null;
	const isAuthenticated = Boolean(session?.user?.id);
	const isAdmin = session?.user?.role === "admin";
	const isAdminRoute = pathname?.startsWith("/admin") ?? false;
	const isParentsRoute = pathname?.startsWith("/parents") ?? false;
	const userStatus = session?.user?.status;

useEffect(() => {
	document.body.style.overflow = isMobileNavOpen ? "hidden" : "";
	return () => {
		document.body.style.overflow = "";
	};
}, [isMobileNavOpen]);

useEffect(() => {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	themePresets.forEach((preset) => {
		if (preset.className) {
			root.classList.remove(preset.className);
		}
	});
	const selected = themePresets.find((preset) => preset.key === activeTheme);
	if (selected?.className) {
		root.classList.add(selected.className);
	}
}, [activeTheme]);

useEffect(() => {
	if (typeof window === "undefined" || !("scrollRestoration" in window.history)) {
		return;
	}
	const previous = window.history.scrollRestoration;
	window.history.scrollRestoration = "manual";
	return () => {
		window.history.scrollRestoration = previous;
	};
}, []);

useEffect(() => {
	window.scrollTo({ top: 0, behavior: "auto" });
}, [pathname]);

	useEffect(() => () => cancelPendingClose(), [cancelPendingClose]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpenMenu(null);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const closeMobileNav = useCallback((scrollToTop = false) => {
		setIsMobileNavOpen(false);
		setMobileExpanded({});
		if (scrollToTop && typeof window !== "undefined") {
			window.scrollTo({ top: 0, behavior: "auto" });
		}
	}, []);

	const handleSignOut = useCallback(() => {
		closeMobileNav();
		void signOut({ callbackUrl: "/member/login" });
	}, [closeMobileNav]);

	const toggleMobileSection = useCallback((key: string) => {
		setMobileExpanded((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
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

	const handleDesktopBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
		const nextTarget = event.relatedTarget as Node | null;
		if (!event.currentTarget.contains(nextTarget)) {
			setOpenMenu(null);
		}
	}, []);

	const renderMobileItem = (item: NavItem, ancestors: string[]): JSX.Element => {
		const key = ancestors.join(">");
		const hasChildren = Boolean(item.children?.length);
		const isExpanded = mobileExpanded[key];
		const contentId = `mobile-nav-${key.replace(/[^a-zA-Z0-9]/g, "-")}`;

		const isActive = isActivePath(pathname ?? null, item.href);
		return (
			<div key={key} className="space-y-2">
				<div className="flex items-start justify-between gap-2">
					<Link
						href={item.href ?? "#"}
						className={cn(
							"flex-1 text-base font-medium",
							isActive ? "text-[var(--brand-primary)]" : "text-[var(--brand-navy)]",
						)}
						onClick={() => closeMobileNav(true)}
					>
						{item.label}
					</Link>
					{hasChildren ? (
						<button
							type="button"
							className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--brand-navy)] transition hover:bg-[var(--brand-primary)]/10"
							aria-expanded={isExpanded}
							aria-controls={contentId}
							aria-label={`${item.label} 하위 메뉴 토글`}
							onClick={() => toggleMobileSection(key)}
						>
							<ChevronDown
								className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
							/>
						</button>
					) : null}
				</div>

				{hasChildren && isExpanded ? (
					<div
						id={contentId}
						role="region"
						aria-label={`${item.label} 하위 메뉴`}
						className="space-y-2 border-l border-[var(--border)] pl-4"
					>
						{item.children!.map((child) => renderMobileItem(child, [...ancestors, child.label]))}
					</div>
				) : null}
			</div>
		);
	};

	return (
		<>
			<header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/85 backdrop-blur">
		<div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4 sm:px-10 lg:px-12">
			<Link href="/" className="flex min-w-0 flex-shrink-0 items-center gap-3">
				<Image src="/images/ideology/logo.jpg" alt="신촌몬테소리" width={44} height={44} className="rounded-full border border-[var(--border)]/60 bg-white/85 p-1" priority />
				<div className="min-w-0 leading-tight">
					<span className="block truncate font-heading text-base font-semibold text-[var(--brand-primary)]">
						신촌몬테소리유치원
					</span>
					<span className="block truncate text-[11px] text-muted-foreground">Shinchon Montessori Kindergarten</span>
				</div>
			</Link>

			<nav className="relative hidden flex-1 flex-nowrap items-center gap-4 text-sm font-medium text-[var(--brand-navy)] md:flex lg:gap-6">
				{navTree.map((item) => {
					const hasChildren = Boolean(item.children?.length);
					const isActive = isActivePath(pathname ?? null, item.href);
					return (
						<div
							key={item.label}
							className="relative"
							onMouseEnter={() => {
								if (!hasChildren) {
									return;
								}
								cancelPendingClose();
								setOpenMenu(item.label);
							}}
							onMouseLeave={(event) => {
								if (!hasChildren) {
									return;
								}
								const nextTarget = event.relatedTarget as Node | null;
								if (nextTarget && event.currentTarget.contains(nextTarget)) {
									return;
								}
								scheduleCloseMenu(item.label);
							}}
							onFocus={() => {
								if (!hasChildren) {
									return;
								}
								cancelPendingClose();
								setOpenMenu(item.label);
							}}
							onBlur={handleDesktopBlur}
						>
					<Link
						href={item.href ?? "#"}
						className={cn(
							"inline-flex items-center gap-1 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1.5 transition hover:bg-[var(--brand-mint)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 lg:px-3",
							isActive ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]" : "text-[var(--brand-navy)]",
						)}
						aria-current={isActive ? "page" : undefined}
					>
						<span className="whitespace-nowrap">{item.label}</span>
								{hasChildren ? (
									<ChevronDown
										className={`h-3.5 w-3.5 transition-transform ${
											openMenu === item.label ? "rotate-180" : ""
										}`}
									/>
								) : null}
							</Link>

						{hasChildren && openMenu === item.label ? (
							<div
								className="absolute left-0 top-full mt-2"
									onMouseEnter={() => {
										cancelPendingClose();
										setOpenMenu(item.label);
									}}
									onMouseLeave={() => scheduleCloseMenu(item.label)}
								>
									<DesktopSubmenu items={item.children ?? []} />
								</div>
							) : null}
						</div>
					);
				})}
			</nav>

			<div className="hidden flex-shrink-0 items-center gap-3 md:flex">
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
						<Button key={cta.key} variant={cta.variant} size="sm" className={cta.className} asChild>
							<Link href={cta.href}>{cta.label}</Link>
						</Button>
					))}
				</div>

				<button
					type="button"
					className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] p-2 text-[var(--brand-navy)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 md:hidden"
					onClick={() => setIsMobileNavOpen(true)}
					aria-label="모바일 메뉴 열기"
				>
					<Menu className="size-5" />
				</button>
			</div>

			{isMobileNavOpen ? (
				<>
					<div
						data-mobile-nav-backdrop
						className="fixed inset-0 z-[70] bg-slate-900/30 backdrop-blur-[2px] md:hidden"
						aria-hidden
						onClick={() => closeMobileNav()}
					/>
					<div
						data-mobile-nav-panel
						className="fixed inset-0 z-[80] flex h-screen flex-col bg-white/95 shadow-2xl ring-1 ring-black/5 md:hidden"
					>
						<div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
							<span className="font-heading text-lg text-[var(--brand-navy)]">신촌몬테소리유치원</span>
							<button
								type="button"
								className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] p-2 text-[var(--brand-navy)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
								onClick={() => closeMobileNav()}
								aria-label="모바일 메뉴 닫기"
							>
								<X className="size-5" />
							</button>
						</div>

						<div data-mobile-nav className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
							<nav className="flex flex-col gap-6 text-base font-medium text-[var(--brand-navy)]">
								{navTree.map((item) => renderMobileItem(item, [item.label]))}
							</nav>

							<div className="mt-8 border-t border-[var(--border)] pt-6 text-sm text-muted-foreground">
								<p className="mb-3 font-semibold text-[var(--brand-navy)]">빠른 연결</p>
								<div className="flex flex-col gap-3">
									{authAction.type === "login" ? (
										<Button
											variant="outline"
											size="sm"
											className="justify-center gap-2 border-[var(--border)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
											asChild
										>
											<Link href={authAction.href} onClick={() => closeMobileNav(true)}>
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

							<div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-6">
								{mobileCtas.map((cta) => (
									<Button
										key={cta.key}
										size="lg"
										variant={cta.variant}
										className={cta.className}
										asChild
									>
										<Link href={cta.href} onClick={() => closeMobileNav(true)}>
											{cta.label}
											{cta.key === "admissions" ? <ArrowRight className="ml-2 size-4" /> : null}
										</Link>
									</Button>
								))}
							</div>
						</div>
					</div>
				</>
			) : null}
		</header>

			<div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
				<div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white/90 px-2 py-1 text-xs shadow-[var(--shadow-soft)] backdrop-blur">
					<span className="px-1 text-[11px] font-semibold tracking-tight text-muted-foreground">테마</span>
					{themePresets.map((preset) => {
						const isActive = activeTheme === preset.key;
						return (
							<button
								key={preset.key}
								type="button"
								onClick={() => setActiveTheme(preset.key)}
								className={`rounded-full px-2 py-0.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 ${
									isActive
										? "bg-[var(--brand-primary)] text-white"
										: "text-[var(--brand-navy)] hover:bg-[var(--brand-mint)]/40"
								}`}
							>
								{preset.label}
							</button>
						);
					})}
				</div>
			</div>
		</>
	);
}

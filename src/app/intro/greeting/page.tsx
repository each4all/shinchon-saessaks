import Image from "next/image";
import Link from "next/link";

import { Quote } from "lucide-react";

import { IntroSidebar } from "@/components/intro/IntroSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { greetingProfiles, type GreetingProfile } from "@/data/greetings";

type SearchParamsInput = Promise<Record<string, string | string[]>> | Record<string, string | string[]>;

type GreetingPageProps = {
	searchParams?: SearchParamsInput;
};

export default async function GreetingPage({ searchParams }: GreetingPageProps = {}) {
	const tabs: GreetingProfile[] = greetingProfiles;
	const resolvedSearchParams =
		typeof searchParams === "object" && searchParams !== null && "then" in searchParams
			? await searchParams
			: (searchParams as Record<string, string | string[]> | undefined) ?? {};
	const tabParam = resolvedSearchParams.tab;
	const requestedTab = Array.isArray(tabParam) ? tabParam[0] : tabParam ?? null;
	const fallbackTab = tabs.find((tab) => tab.slug === "chair")?.slug ?? tabs[0]?.slug ?? "chair";
	const defaultValue = requestedTab && tabs.some((tab) => tab.slug === requestedTab) ? requestedTab : fallbackTab;

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">유치원 소개</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">인사말</h1>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>유치원 소개</span>
						<span>/</span>
						<span>인사말</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="space-y-8">
					<Tabs key={defaultValue} defaultValue={defaultValue} className="w-full">
						<div className="flex justify-center">
							<TabsList className="flex flex-wrap items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-3 py-2 shadow-[var(--shadow-soft)]">
								{tabs.map((tab) => (
									<TabsTrigger
										key={tab.slug}
										value={tab.slug}
										className="min-w-[120px] rounded-[var(--radius-md)] border border-transparent px-3 py-1.5 text-sm font-semibold data-[state=active]:border-[var(--brand-primary)] data-[state=active]:bg-[var(--brand-mint)]/20"
									>
										{tab.label}
									</TabsTrigger>
								))}
							</TabsList>
						</div>

					{tabs.map((tab) => (
						<TabsContent key={tab.slug} value={tab.slug} className="mt-6">
							<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
								<IntroSidebar />
								<GreetingPanel tab={tab} />
							</div>
						</TabsContent>
					))}
				</Tabs>
			</div>
			</section>
		</div>
	);
}

function GreetingPanel({ tab }: { tab: GreetingProfile }) {
	const isChairProfile = tab.slug === "chair" || tab.label.includes("이사장");
	const isPrincipalProfile = tab.slug === "principal";
	const isTeacherProfile = tab.slug === "teachers";
	const leadText = tab.leadText?.trim();
	const images = tab.images?.length ? tab.images : [];

	const bodyContent = (
		<>
			{isPrincipalProfile && (tab.greetingHeading || tab.greetingSubheading) ? (
				<div className="space-y-1">
					{tab.greetingHeading ? (
						<p className="text-xl font-heading text-[var(--brand-navy)]">{tab.greetingHeading}</p>
					) : null}
					{tab.greetingSubheading ? (
						<p className="text-base text-muted-foreground">{tab.greetingSubheading}</p>
					) : null}
				</div>
			) : null}

			{isTeacherProfile && tab.title ? (
				<div className="space-y-1">
					<h2 className="text-xl font-heading text-[var(--brand-navy)]">{tab.title}</h2>
				</div>
			) : null}

			{leadText ? (
				<p className="rounded-[var(--radius-md)] border border-[var(--brand-primary)] bg-[var(--brand-mint)]/30 px-4 py-3 text-sm font-semibold text-[var(--brand-navy)]">
					{leadText}
				</p>
			) : null}

			{tab.highlights?.map((highlight) => (
				<figure
					key={highlight.text}
					className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--brand-mint)]/20 p-4 text-[var(--brand-primary)]"
				>
					<div className="flex items-start gap-3">
						<Quote className="mt-1 size-5" aria-hidden />
						<blockquote className="text-sm leading-relaxed">{highlight.text}</blockquote>
					</div>
					<figcaption className="mt-2 text-right text-xs font-medium text-muted-foreground">— {highlight.source}</figcaption>
				</figure>
			))}

			{tab.body?.split("\n").map((paragraph, index) =>
				paragraph.trim() ? (
					<p
						key={`${tab.slug}-p-${index}`}
						className={`${isPrincipalProfile ? "text-base" : "text-sm"} leading-relaxed text-muted-foreground`}
					>
						{paragraph.trim()}
					</p>
				) : (
					<span key={`${tab.slug}-space-${index}`} className="block" aria-hidden />
				),
			)}

			{tab.closing ? (
				<p
					className={`rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium ${
						isPrincipalProfile
							? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] italic"
							: "border border-[var(--brand-primary)] bg-white/90 text-[var(--brand-primary)]"
					}`}
				>
					{tab.closing}
				</p>
			) : null}
		</>
	);

	const renderImageGrid = (className: string) => (
		<div className={`${className} h-full ${(isPrincipalProfile || tab.slug === "teachers") ? "justify-center" : ""}`}>
			{images.length ? (
				images.map((slot) => (
					<figure
						key={slot.id}
						className={`flex h-full flex-col ${
							isTeacherProfile
								? "max-w-[320px] mx-auto"
								: `rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] ${
										isPrincipalProfile ? "max-w-[260px] mx-auto" : ""
								  }`
						}`}
					>
						<div
							className={`relative w-full ${
								isTeacherProfile
									? "bg-transparent"
									: "border-b border-[var(--border)] bg-white"
							} ${
								isPrincipalProfile ? "h-[286px]" : tab.slug === "teachers" ? "h-[300px]" : "min-h-[340px]"
							}`}
						>
							<Image
								src={slot.src}
								alt={slot.alt}
								width={600}
								height={800}
								className={
									isPrincipalProfile
										? "h-full w-auto object-cover mx-auto"
									: tab.slug === "teachers"
									? "h-full w-auto object-cover mx-auto"
									: "h-full w-full object-cover"
								}
								style={{ borderRadius: 0 }}
								priority={slot.priority}
							/>
						</div>
						{!isTeacherProfile && (slot.captionTitle || slot.captionDetail) ? (
							<figcaption className="px-4 py-3 text-center text-sm text-[var(--brand-navy)]">
								{slot.captionTitle ? <p className="font-semibold">{slot.captionTitle}</p> : null}
								{slot.captionDetail ? (
									<p className="text-xs text-muted-foreground">{slot.captionDetail}</p>
								) : null}
							</figcaption>
						) : null}
					</figure>
				))
			) : (
				<div className="flex min-h-[320px] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--brand-mint)]/10 text-sm text-muted-foreground">
					이미지를 등록해 주세요.
				</div>
			)}
		</div>
	);

	const credentialsBlock =
		tab.credentials.length > 0 || tab.credentialHeading ? (
			<div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 p-5 text-sm leading-relaxed text-muted-foreground">
				<p className="mb-3 font-semibold text-[var(--brand-navy)]">
					{tab.credentialHeading ?? "주요 약력"}
				</p>
				<ul className="space-y-1">
					{tab.credentials?.map((item) => (
						<li key={item} className="flex items-start gap-2">
							<span className="mt-[6px] inline-flex size-1.5 rounded-full bg-[var(--brand-primary)]" />
							<span>{item}</span>
						</li>
					))}
				</ul>
			</div>
		) : null;

	if (isPrincipalProfile) {
		return (
			<article id={tab.slug} className="space-y-6">
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-stretch">
					<div className="flex h-full flex-col gap-4">
						{credentialsBlock}
					</div>

					{renderImageGrid("grid")}
				</div>

				<div className="space-y-4">{bodyContent}</div>
			</article>
		);
}
const shouldShowHeader = !isChairProfile && !isPrincipalProfile && !isTeacherProfile;
const leftColumnAlignment = isTeacherProfile ? "justify-center" : "";

	return (
		<article id={tab.slug} className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
			<div className={`flex h-full flex-col gap-4 ${leftColumnAlignment}`}>
				{shouldShowHeader ? (
					<header className="space-y-2">
						{tab.title ? (
							<h2 className="text-[clamp(1.6rem,2.4vw,2.2rem)] font-semibold text-[var(--brand-navy)]">
								{tab.title}
							</h2>
						) : null}
						{tab.people?.length ? (
							<div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
								{tab.people.map((person) => (
									<span key={person.name} className="inline-flex items-center gap-2">
										<span className="font-medium text-[var(--brand-primary)]">{person.name}</span>
										<span className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
											{person.role}
										</span>
									</span>
								))}
							</div>
						) : null}
					</header>
				) : null}

				{credentialsBlock}
				{bodyContent}
			</div>

			{renderImageGrid(isChairProfile ? "grid gap-4 sm:grid-cols-2" : "grid")}
		</article>
	);
}

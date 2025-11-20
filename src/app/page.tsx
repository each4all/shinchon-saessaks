import {
	ArrowRight,
	Baby,
	BookOpenCheck,
	CalendarCheck2,
	HeartHandshake,
	MapPin,
	Megaphone,
	Microscope,
	Sparkles,
	ShieldCheck,
	Trees,
	Home as HomeIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { dailyRhythm } from "@/data/curriculum";
import { newsCategories, type NewsPost } from "@/lib/data/news";
import { getHighlightedNews, getNewsList } from "@/lib/data/news-repository";

const heroStats = [
	{ label: "모집 연령", value: "만 3-5세" },
	{ label: "학급 구성", value: "연령혼합 6개 반" },
	{ label: "학부모 만족도", value: "97%" },
];

// Ref: 신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:331-475 (교육 철학 및 프로그램 핵심 메시지)
const learningPillars = [
	{
		icon: Sparkles,
		title: "Montessori Fundamentals",
		description:
			"감각·언어·문화·실생활 교구를 활용해 자율성과 집중력을 키우는 진짜 몬테소리 환경을 운영합니다.",
	},
	{
		icon: Microscope,
		title: "Exploration & Project",
		description:
			"생태·과학·예술 프로젝트가 주 단위로 이어져 아이가 경험과 발견을 통해 배움의 연결고리를 만듭니다.",
	},
	{
		icon: HeartHandshake,
		title: "Family Partnership",
		description:
			"월간 포트폴리오, 상담 및 워크숍으로 가정과 교실이 같은 리듬을 타도록 적극적으로 연결합니다.",
	},
];

// Ref: 신촌몬테소리유치원_사이트맵_및_페이지구조.md:420-520 (연령별 프로그램 소개 섹션 요청 사항)
const programTracks = [
	{
		title: "Casa Petit (만 3세)",
		description:
			"첫등원 아이들이 스스로 생활을 돌보는 법을 배우고, 감각교구로 기초 개념을 쌓는 적응형 프로그램.",
		focus: ["일상생활 훈련", "감각 탐색", "정서 안정"],
	},
	{
		title: "Casa Prime (만 4세)",
		description:
			"문해·수리·문화 영역을 확장하며 친구와의 협업 프로젝트를 시작하는 성장 단계의 커리큘럼.",
		focus: ["언어 확장", "프로젝트 협업", "자율 놀이"],
	},
	{
		title: "Casa Explorer (만 5세)",
		description:
			"통합 탐구 주제를 통해 초등 전환을 준비하고, 리더십과 발표력을 기르는 심화 과정.",
		focus: ["융합 프로젝트", "발표·기록 역량", "초등 연계"],
	},
];

const environmentHighlights = [
	{
		icon: HomeIcon,
		title: "따뜻한 실내 학습 환경",
		description:
			"햇살이 잘 드는 교실과 연령별 맞춤 교구 배치를 통해 아이가 스스로 선택하고 집중할 수 있는 공간을 마련했어요.",
	},
	{
		icon: Trees,
		title: "도심 속 자연 놀이터",
		description: "옥상 정원과 야외 놀이장을 활용해 사계절 자연 놀이와 생태 체험을 진행합니다. 매주 숲 체험 활동도 이어져요.",
	},
	{
		icon: ShieldCheck,
		title: "안전한 공기·보안 시스템",
		description:
			"CCTV, 공기질 모니터링, 출입 통제 시스템을 도입해 통학길부터 교실까지 안심하고 머무를 수 있도록 관리하고 있습니다.",
	},
];

// Ref: 신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:600-665 (입학 절차 단계 정의)
const admissionsSteps = [
	{
		title: "입학 상담 신청",
		description: "온라인 또는 전화로 상담을 예약해 주세요. 24시간 이내 담당 교사가 확인 연락을 드립니다.",
	},
	{
		title: "현장 투어 & 인터뷰",
		description: "원에서 직접 환경을 둘러보고 교육 철학·프로그램을 상세히 안내받습니다.",
	},
	{
		title: "등록 안내 및 배정",
		description: "반 배정, 등원 일정, 준비물 리스트를 안내해 드리며 필요 시 적응 프로그램을 조율합니다.",
	},
];

// Ref: 신촌몬테소리유치원_웹사이트_개선_요구사항_명세서.md:705-760 (오시는 길 및 상담 정보 안내)
const visitInfos = [
	{
		icon: MapPin,
		label: "주소",
		value: "서울특별시 서대문구 신촌로 43 (신촌역 1번 출구 도보 5분)",
	},
	{
		icon: CalendarCheck2,
		label: "상담 가능 시간",
		value: "평일 09:30 - 17:30 (주말·공휴일 사전 예약)",
	},
	{
		icon: Baby,
		label: "투어 참여",
		value: "보호자 동반 투어 가능, 아이와 함께 체험 코스 제공",
	},
];

function formatNewsDate(date: Date | null) {
	if (!date) {
		return "";
	}
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

function resolveCategoryLabel(key: NewsPost["category"]) {
	return newsCategories.find((category) => category.key === key)?.label ?? key;
}

export default async function Home() {
	const highlightedNews = await getHighlightedNews(3);
	const homepageNews =
		highlightedNews.length > 0 ? highlightedNews : await getNewsList({ limit: 3 });
	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
		<section id="hero" data-testid="hero" className="relative isolate overflow-hidden">
			<div
				className="pointer-events-none absolute inset-0"
				style={{ background: "var(--gradient-cloudwalk)" }}
			/>
			<div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-12 lg:py-28">
				<div className="flex flex-col gap-6 text-center sm:max-w-4xl sm:text-left">
					<Badge
						lang="en"
						variant="sunshine"
						className="mx-auto w-fit uppercase tracking-[0.18em] sm:mx-0"
					>
						Shinchon Montessori
					</Badge>
					<h1 className="font-heading text-[clamp(3rem,5.2vw,4rem)] leading-[1.05] text-[var(--brand-navy)]">
						아이의 가능성이 자연스럽게 자라는 하루를 디자인합니다.
					</h1>
					<p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground sm:mx-0">
						신촌몬테소리유치원은 몬테소리 철학과 프로젝트 러닝을 결합해 아이가 스스로 선택하고 몰입하는 배움 환경을 제공합니다. 가정과 함께 아이의 리듬을 발견하고 키워가세요.
					</p>
				</div>

				<div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
					<div className="flex flex-wrap gap-3">
						<Button asChild size="lg">
							<Link href="/#admissions">
									입학 상담 예약하기
									<ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
							<Button variant="secondary" size="lg" asChild>
								<Link href="/#programs">교육 프로그램 보기</Link>
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">
							상담 신청 후 24시간 내 담당 교사가 연락드리며, 원 방문 투어를 조율합니다.
						</p>
					</div>

				<div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
						{heroStats.map((item) => (
							<div
								key={item.label}
								className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-6 py-5 shadow-[var(--shadow-soft)] backdrop-blur-sm"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
									{item.label}
								</p>
								<p className="mt-2 font-heading text-2xl">{item.value}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section
				id="about"
				className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 sm:px-10 lg:px-12"
			>
				<header className="max-w-3xl space-y-4">
					<Badge variant="outline" className="normal-case tracking-[0.02em]">
						우리의 교육 약속
					</Badge>
					<h2 className="font-heading text-[clamp(2.5rem,4.5vw,3.5rem)] leading-[1.12]">
						아이·교사·가정이 함께 만드는 Petit Learning Journey
					</h2>
					<p className="text-base leading-relaxed text-muted-foreground">
						몬테소리 핵심 가치에 창의 프로젝트, 가족 참여 프로그램을 결합해 아이가 자율성과 관계성을
						동시에 기를 수 있도록 돕습니다.
					</p>
				</header>

				<div className="grid gap-6 md:grid-cols-3">
					{learningPillars.map((pillar) => (
						<Card key={pillar.title} className="h-full">
							<CardHeader className="space-y-3">
								<div className="inline-flex size-12 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--brand-secondary)]/12 text-[var(--brand-secondary)] shadow-[var(--shadow-soft)]">
									<pillar.icon className="size-5" />
								</div>
								<CardTitle className="font-heading text-xl text-[var(--brand-navy)]">
									{pillar.title}
								</CardTitle>
								<CardDescription className="text-sm leading-relaxed text-muted-foreground">
									{pillar.description}
								</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>
			</section>

			<section
				id="environment"
				className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 sm:px-10 lg:px-12"
			>
				<header className="space-y-4">
					<Badge variant="outline" className="normal-case tracking-[0.02em]">
						교육환경
					</Badge>
					<h2 className="font-heading text-[clamp(2.25rem,4vw,3.25rem)] leading-tight">
						아이들이 숨 쉬는 공간을 세심하게 설계했어요
					</h2>
					<p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
						실내 교실에서 야외 놀이터까지, 아이가 하루를 보내는 모든 공간을 안전하고 따뜻하게 가꾸고
						있습니다.
					</p>
				</header>

				<div className="grid gap-6 md:grid-cols-3">
					{environmentHighlights.map((item) => (
						<Card key={item.title} className="h-full border-[var(--brand-secondary)]/20">
							<CardHeader className="space-y-3">
								<div className="inline-flex size-12 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--brand-mint)]/30 text-[var(--brand-secondary)] shadow-[var(--shadow-soft)]">
									<item.icon className="size-5" />
								</div>
								<CardTitle className="font-heading text-xl text-[var(--brand-navy)]">
									{item.title}
								</CardTitle>
								<CardDescription className="text-sm leading-relaxed text-muted-foreground">
									{item.description}
								</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>
			</section>

			<section
				id="programs"
				className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 sm:px-10 lg:px-12"
			>
				<header className="space-y-4">
					<Badge variant="mint" className="normal-case tracking-[0.02em]">
						교육 프로그램
					</Badge>
					<h2 className="font-heading text-[clamp(2.25rem,4vw,3.25rem)] leading-tight">
						연령과 리듬에 맞춘 3단계 Casa 커리큘럼
					</h2>
					<p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
						아이의 발달 단계를 세밀하게 관찰하며, 연령 혼합 반에서 서로 배우고 돕는 경험을 설계합니다.
						각 과정은 가정 연계 활동과 포트폴리오 공유를 통해 학습 여정을 기록합니다.
					</p>
				</header>

				<div className="grid gap-6 lg:grid-cols-3">
					{programTracks.map((track) => (
						<Card key={track.title} className="h-full border-[var(--brand-secondary)]/15">
							<CardHeader className="space-y-3">
								<CardTitle className="font-heading text-xl text-[var(--brand-navy)]">
									{track.title}
								</CardTitle>
								<CardDescription className="text-sm leading-relaxed text-muted-foreground">
									{track.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-2">
								{track.focus.map((item) => (
									<Badge
										key={item}
										variant="outline"
										className="text-xs normal-case tracking-[0.01em]"
									>
										{item}
									</Badge>
								))}
							</CardContent>
						</Card>
					))}
				</div>

				<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/85 p-8 shadow-[var(--shadow-soft)] backdrop-blur">
					<div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
						<div className="max-w-xl space-y-3">
							<h3 className="font-heading text-[clamp(1.875rem,3vw,2.5rem)] leading-tight">
								하루 일과 속에서 자율과 협업이 자연스럽게 이어집니다
							</h3>
							<p className="text-sm leading-relaxed text-muted-foreground">
								유연한 Work Cycle과 야외 활동, 프로젝트 시간이 균형을 이루어 아이의 리듬을 존중하면서도
								풍부한 자극을 제공합니다.
							</p>
						</div>
						<div className="grid w-full gap-4 sm:grid-cols-2 xl:w-auto">
							{dailyRhythm.map((item) => (
								<div
									key={item.time}
									className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/90 p-4 text-sm shadow-sm"
								>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
										{item.time}
									</p>
									<p className="mt-2 font-heading text-lg">{item.title}</p>
									<p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section
				id="admissions"
				className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 sm:px-10 lg:px-12"
			>
				<header className="max-w-3xl space-y-4">
					<Badge variant="secondary" className="normal-case tracking-[0.02em]">
						입학 안내
					</Badge>
					<h2 className="font-heading text-[clamp(2.25rem,4vw,3rem)] leading-tight">
						입학 절차는 간단하게, 만남과 적응은 세심하게
					</h2>
					<p className="text-base leading-relaxed text-muted-foreground">
						온라인 상담 신청부터 반 배정까지 모든 단계에서 담당 교사가 동행하며 아이와 가족의 질문에
						귀 기울입니다.
					</p>
				</header>

				<div className="grid gap-6 md:grid-cols-3">
					{admissionsSteps.map((step, index) => (
						<Card key={step.title} className="h-full border-[var(--brand-primary)]/15">
							<CardHeader className="space-y-3">
								<Badge
									variant="ghost"
									className="text-xs normal-case tracking-[0.01em] text-[var(--brand-primary)]"
								>
									Step {index + 1}
								</Badge>
								<CardTitle className="font-heading text-xl text-[var(--brand-navy)]">
									{step.title}
								</CardTitle>
								<CardDescription className="text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>

					<div
						data-testid="cta-section"
						className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--brand-primary)]/30 bg-white/85 px-6 py-8 shadow-[var(--shadow-soft)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
					>
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">상담 전화</p>
						<p className="font-heading text-2xl text-[var(--brand-primary)]">02-324-0671</p>
						<p className="text-sm text-muted-foreground">
							평일 오전 9시 30분부터 오후 5시 30분까지 전화 상담을 운영합니다.
						</p>
					</div>

					<Button size="lg" variant="default" asChild>
						<Link href="mailto:hello@shinchonkid.com">
							이메일 상담 요청하기
							<ArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</div>
			</section>

			<section
				id="news"
				className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 sm:px-10 lg:px-12"
			>
				<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-3">
					<Badge variant="outline" className="normal-case tracking-[0.02em]">
						알림마당
					</Badge>
						<h2 className="font-heading text-[clamp(2rem,3.5vw,3rem)] leading-tight">
							학부모와 함께 나누는 최신 소식
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							공지사항, 가정통신문, 행사 소식을 빠르게 업데이트하고 PWA 알림으로 확장할 예정입니다.
						</p>
					</div>
					<Button variant="ghost" size="lg" className="w-full sm:w-auto" asChild>
						<Link href="/news">
							알림마당 전체 보기
							<ArrowRight className="ml-2 size-4" />
						</Link>
					</Button>
				</header>

				<div className="grid gap-6 md:grid-cols-3">
					{homepageNews.length === 0 ? (
						<p className="py-12 text-center text-sm text-muted-foreground">
							등록된 소식이 없습니다.
						</p>
					) : (
						homepageNews.map((item) => (
							<Card key={item.id} className="h-full border-[var(--border)]">
							<CardHeader className="space-y-3">
								<Badge
									variant="ghost"
									className="w-fit text-xs normal-case tracking-[0.01em] text-[var(--brand-secondary)]"
								>
									{resolveCategoryLabel(item.category)}
								</Badge>
								<CardTitle className="text-lg text-[var(--brand-navy)]">{item.title}</CardTitle>
								<CardDescription className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
									{formatNewsDate(item.publishAt ?? item.createdAt)}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-sm leading-relaxed text-muted-foreground">
									{item.summary ?? item.content[0] ?? "자세한 내용을 확인해 주세요."}
								</p>
								<Button variant="link" className="px-0 text-[var(--brand-secondary)]" asChild>
									<Link href={`/news/${item.slug}`}>
										자세히 보기
										<ArrowRight className="ml-1 size-4" />
									</Link>
								</Button>
							</CardContent>
						</Card>
						))
					)}
				</div>
			</section>

			<section
				id="visit"
				className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 sm:px-10 lg:px-12"
			>
				<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/85 p-8 shadow-[var(--shadow-soft)] backdrop-blur">
					<div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
						<div className="max-w-xl space-y-4">
							<Badge variant="sunshine" className="text-xs uppercase tracking-[0.16em]">
								Visit & Contact
							</Badge>
							<h2 className="font-heading text-[clamp(2rem,3.5vw,3rem)] leading-tight">
								신촌역에서 5분, 언제든 따뜻하게 맞이할 준비가 되어 있습니다
							</h2>
							<p className="text-sm leading-relaxed text-muted-foreground">
								안전한 통학 동선과 CCTV, 공기질 관리 시스템을 갖춘 실내·외 학습 공간을 투어로 직접 확인해
								보세요. 주차 안내 및 셔틀 정보는 상담 시 상세히 안내해 드립니다.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2 lg:w-[420px]">
							{visitInfos.map((info) => (
								<div
									key={info.label}
									className="flex h-full flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/90 p-4 shadow-sm"
								>
									<div className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--brand-mint)]/40 text-[var(--brand-secondary)]">
										<info.icon className="size-5" />
									</div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
										{info.label}
									</p>
									<p className="text-sm leading-relaxed text-[var(--brand-navy)]">{info.value}</p>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-2 text-[var(--brand-secondary)]">
						<Megaphone className="size-4" />
						<span>PWA 알림 기능으로 학사 일정과 긴급 공지를 모바일로 바로 전달할 준비를 하고 있습니다.</span>
					</div>
					<div className="flex items-center gap-2 text-[var(--brand-secondary)]">
						<BookOpenCheck className="size-4" />
						<span>학부모 포털 베타는 2025년 상반기 오픈 예정입니다.</span>
					</div>
				</div>
			</section>
		</div>
	);
}

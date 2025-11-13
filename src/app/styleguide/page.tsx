import type { ComponentProps } from "react";

import {
	brandPrinciples,
	colorPalette,
	gradientTokens,
	motionGuidelines,
	radiiScale,
	shadowTokens,
	spacingScale,
	typographyScale,
} from "@/lib/design-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ButtonVariant = ComponentProps<typeof Button>["variant"];
type BadgeVariant = ComponentProps<typeof Badge>["variant"];

const buttonShowcase: Array<{
	label: string;
	variant: ButtonVariant;
	text: string;
	description: string;
	size?: ComponentProps<typeof Button>["size"];
}> = [
	{
		label: "Primary CTA",
		variant: "default",
		text: "입학 상담 신청",
		description: "가장 중요한 전환을 유도하는 기본 버튼 스타일.",
		size: "lg",
	},
	{
		label: "Gradient Highlight",
		variant: "gradient",
		text: "캠퍼스 투어 예약",
		description: "히어로나 주요 섹션에서 시선을 끌 때 사용합니다.",
		size: "lg",
	},
	{
		label: "Secondary CTA",
		variant: "secondary",
		text: "교육 프로그램 살펴보기",
		description: "보조 행동을 안내할 때 어울리는 파스텔 톤.",
		size: "lg",
	},
	{
		label: "Outline / Quiet",
		variant: "outline",
		text: "학부모 후기 보기",
		description: "화이트 배경 위에서 조용히 보조 액션을 제공.",
	},
	{
		label: "Soft Surface",
		variant: "soft",
		text: "주간 일정 확인",
		description: "Calendars, 카드 내부 서브 액션 용도.",
	},
	{
		label: "Ghost Link",
		variant: "ghost",
		text: "소식 더 보기",
		description: "텍스트 중심 영역이나 컬러 대비가 강한 배경에서 사용.",
		size: "default",
	},
	{
		label: "Text Link",
		variant: "link",
		text: "FAQ 전체보기",
		description: "본문 내 인라인 링크 스타일.",
	},
];

const badgeShowcase: Array<{
	label: string;
	variant: BadgeVariant;
	text: string;
	description: string;
}> = [
	{
		label: "Primary",
		variant: "default",
		text: "Premium",
		description: "프로그램 대표 태그, 핵심 라벨에 사용.",
	},
	{
		label: "Sunshine",
		variant: "sunshine",
		text: "Event",
		description: "행사/이벤트 같은 밝은 톤 하이라이트.",
	},
	{
		label: "Seafoam",
		variant: "mint",
		text: "Open",
		description: "편안한 긍정 상태, 교사 추천 포인트에 사용.",
	},
	{
		label: "Info",
		variant: "info",
		text: "Guide",
		description: "도움말, 가이드 배지에 활용.",
	},
	{
		label: "Warning",
		variant: "warning",
		text: "D-3",
		description: "마감 임박, 유의 메시지를 전달.",
	},
	{
		label: "Outline",
		variant: "outline",
		text: "New",
		description: "밝은 배경에서 조용한 상태를 표현.",
	},
];

const componentTableRows = [
	{
		title: "2025학년도 입학 설명회",
		status: { label: "모집 중", variant: "mint" as BadgeVariant },
		date: "2025.11.05",
		audience: "예비 학부모",
	},
	{
		title: "11월 숲 체험 클래스",
		status: { label: "마감 임박", variant: "warning" as BadgeVariant },
		date: "2025.10.27",
		audience: "전체 반",
	},
	{
		title: "학부모 상담 주간",
		status: { label: "예약 진행", variant: "info" as BadgeVariant },
		date: "2025.10.15",
		audience: "담임 교사",
	},
];

const navigationTabs = [
	{
		value: "overview",
		label: "원 소개",
		title: "아이의 하루가 반짝이는 공간",
		copy: "교실과 야외 공간이 자연스럽게 연결되는 구조로 아이들의 호기심을 자극합니다.",
	},
	{
		value: "curriculum",
		label: "교육 프로그램",
		title: "몬테소리 · 생태 · 이중언어",
		copy: "일과 속에서 감각, 자연, 언어 경험이 유기적으로 이어지는 통합 커리큘럼입니다.",
	},
	{
		value: "admission",
		label: "입학 안내",
		title: "3단계 온라인 절차",
		copy: "상담 신청 → 캠퍼스 투어 → 지원서 접수 순으로 진행되며, 온라인으로 간편하게 완료할 수 있습니다.",
	},
];

function ColorGroup({
	label,
	tokens,
}: {
	label: string;
	tokens: typeof colorPalette.brand;
}) {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-slate-800">{label}</h3>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{tokens.map((token) => (
					<Card
						key={token.token}
						className="h-full border-none bg-white/85 backdrop-blur-sm"
						style={{ boxShadow: "var(--shadow-soft)" }}
					>
						<CardHeader className="space-y-3">
							<div
								className="h-20 w-full rounded-2xl"
								style={{ background: token.value }}
							/>
							<CardTitle className="text-base text-slate-900">
								{token.name}
							</CardTitle>
							<CardDescription className="font-mono text-xs text-slate-500">
								{token.token} · {token.value}
							</CardDescription>
						</CardHeader>
						<CardContent className="text-sm text-slate-600">
							{token.usage}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

function ScaleList({
	title,
	tokens,
}: {
	title: string;
	tokens: typeof spacingScale;
}) {
	return (
		<Card
			className="border-none bg-white/80"
			style={{ boxShadow: "var(--shadow-soft)" }}
		>
			<CardHeader>
				<CardTitle className="text-base text-slate-900">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{tokens.map((token) => (
					<div
						key={token.token}
						className="flex items-center justify-between rounded-2xl bg-[#F8F6FF] px-4 py-3"
					>
						<div>
							<p className="font-mono text-xs text-slate-500">
								{token.token}
							</p>
							<p className="text-sm text-slate-700">{token.usage}</p>
						</div>
						<span className="text-sm font-semibold text-slate-700">
							{token.value}
						</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

export default function StyleguidePage() {
	return (
		<div className="mx-auto max-w-6xl space-y-16 px-6 pb-24 sm:px-10 lg:px-12">
			<section className="relative overflow-hidden rounded-[56px] border border-white/60 bg-white/75 px-10 py-16 shadow-[var(--shadow-ambient)]">
				<div
					className="absolute -left-20 top-6 h-64 w-64 rounded-full blur-3xl"
					style={{ background: "#BCD3FF" }}
				/>
				<div
					className="absolute -right-16 bottom-8 h-72 w-72 rounded-full blur-3xl"
					style={{ background: "#FFD1EC" }}
				/>
				<div
					className="absolute right-20 top-10 hidden h-36 w-36 rounded-full blur-3xl md:block"
					style={{ background: "#FFE9A8" }}
				/>
				<div className="relative z-10 space-y-6 text-slate-900">
					<Badge className="w-fit rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
						Petit Kindergarten System
					</Badge>
					<h1 className="font-heading text-balance text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
						포근한 파스텔 무드로 정리한
						<br className="hidden md:block" /> 신촌몬테소리 디자인 시스템
					</h1>
					<p className="max-w-3xl text-lg text-slate-600 md:text-xl">
						ThemeForest Petit Kindergarten 프리뷰의 라우팅과 톤앤매너를 참고해 색상,
						타이포그래피, 공간, 그림자 토큰을 정리했습니다. 이 가이드는 추후 페이지 구현 전
						일관된 비주얼을 보장합니다.
					</p>
				</div>
			</section>

			<section className="space-y-6" id="principles">
				<header className="space-y-3">
					<h2 className="font-heading text-3xl font-semibold text-slate-900">
						Design principles
					</h2>
					<p className="max-w-2xl text-slate-600">
						샘플 테마에서 느껴지는 온기, 공간감, 플레이풀함을 유지하기 위한 핵심 원칙입니다.
					</p>
				</header>
				<div className="grid gap-6 md:grid-cols-3">
					{brandPrinciples.map((principle) => (
						<Card
							key={principle.title}
							className="border-none bg-white/85"
							style={{ boxShadow: "var(--shadow-soft)" }}
						>
							<CardHeader className="space-y-2">
								<CardTitle className="text-xl text-slate-900">
									{principle.title}
								</CardTitle>
								<CardDescription className="text-slate-600">
									{principle.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="text-sm text-slate-500">
								{principle.detail}
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="space-y-8" id="colors">
				<header className="space-y-3">
					<h2 className="font-heading text-3xl font-semibold text-slate-900">
						Color palette
					</h2>
					<p className="max-w-3xl text-slate-600">
						CTA, 섹션 배경, 카드에 반복적으로 등장하는 파스텔 톤을 토큰화했습니다. 모든 색상은
						WCAG 대비를 위해 텍스트 컬러와 함께 사용해야 합니다.
					</p>
				</header>
				<div className="space-y-10">
					<ColorGroup label="Brand" tokens={colorPalette.brand} />
					<ColorGroup label="Neutrals" tokens={colorPalette.neutrals} />
					<ColorGroup label="Feedback" tokens={colorPalette.feedback} />
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					{gradientTokens.map((gradient) => (
						<Card
							key={gradient.token}
							className="overflow-hidden border-none text-white"
							style={{
								background: gradient.value,
								boxShadow: "var(--shadow-elevated)",
							}}
						>
							<CardHeader>
								<CardTitle className="text-lg">{gradient.name}</CardTitle>
								<CardDescription className="font-mono text-xs text-white/80">
									{gradient.token}
								</CardDescription>
							</CardHeader>
							<CardContent className="text-sm text-white/90">
								{gradient.usage}
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="space-y-8" id="typography">
				<header className="space-y-3">
					<h2 className="font-heading text-3xl font-semibold text-slate-900">
						Typography
					</h2>
					<p className="max-w-2xl text-slate-600">
						Fredoka와 Noto Sans KR의 조합으로 친근하면서도 가독성 높은 위계를 형성합니다.
						아래 스케일을 기준으로 섹션별 헤더와 본문 용도를 결정합니다.
					</p>
				</header>
				<div className="grid gap-6">
					{typographyScale.map((item) => (
						<Card
							key={item.token}
							className="border-none bg-white/80"
							style={{ boxShadow: "var(--shadow-soft)" }}
						>
							<CardHeader className="space-y-1">
								<CardTitle className="text-base text-slate-900">
									{item.name}
								</CardTitle>
								<CardDescription className="font-mono text-xs text-slate-500">
									{item.token} · {item.size} / {item.lineHeight}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<p
									className="font-heading text-slate-900"
									style={{
										fontSize: item.size,
										lineHeight: item.lineHeight,
									}}
								>
									{item.sample}
								</p>
								<p className="text-sm text-slate-600">{item.usage}</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="space-y-8" id="layout">
				<header className="space-y-3">
					<h2 className="font-heading text-3xl font-semibold text-slate-900">
						Spacing &amp; layout
					</h2>
					<p className="max-w-2xl text-slate-600">
						4pt 계열을 기반으로 한 공간 토큰은 카드, 섹션, 폼에서 일관된 시각적 리듬을 유지하게
						해줍니다.
					</p>
				</header>
				<div className="grid gap-6 lg:grid-cols-2">
					<ScaleList title="Spacing scale" tokens={spacingScale} />
					<ScaleList title="Radius scale" tokens={radiiScale} />
				</div>
			</section>

			<section className="space-y-8" id="depth">
				<header className="space-y-3">
					<h2 className="font-heading text-3xl font-semibold text-slate-900">
						Depth &amp; elevation
					</h2>
					<p className="max-w-2xl text-slate-600">
						흐릿한 그림자는 어린이 테마 특유의 따뜻함을 줍니다. hover 시 그림자를 강조하여
						인터랙션을 드러냅니다.
					</p>
				</header>
				<Table className="overflow-hidden rounded-3xl border-none bg-white/85 shadow-[var(--shadow-soft)]">
					<TableHeader>
						<TableRow className="bg-[#F5F2FF] text-slate-700">
							<TableHead className="font-semibold">Token</TableHead>
							<TableHead className="font-semibold">Value</TableHead>
							<TableHead className="font-semibold">Usage</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{shadowTokens.map((token) => (
							<TableRow key={token.token} className="text-slate-700">
								<TableCell className="font-mono text-xs text-slate-500">
									{token.token}
								</TableCell>
								<TableCell>{token.value}</TableCell>
								<TableCell className="text-sm text-slate-600">
									{token.usage}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</section>

			<section className="space-y-8" id="motion">
				<header className="space-y-3">
					<h2 className="font-heading text-3xl font-semibold text-slate-900">
						Motion
					</h2>
					<p className="max-w-2xl text-slate-600">
						Playful motion은 과하지 않은 지속시간과 완만한 곡선을 사용해 부드러운 경험을
						제공합니다.
					</p>
				</header>
				<div className="grid gap-4 md:grid-cols-3">
					{motionGuidelines.map((item) => (
						<Card
							key={item.name}
							className="border-none bg-white/80"
							style={{ boxShadow: "var(--shadow-soft)" }}
						>
							<CardHeader>
								<CardTitle className="text-lg text-slate-900">
									{item.name}
								</CardTitle>
								<CardDescription className="font-mono text-xs text-slate-500">
									{item.token}
								</CardDescription>
							</CardHeader>
							<CardContent className="text-sm text-slate-600">
								{item.usage}
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="space-y-8" id="components">
				<header className="space-y-3">
					<h2 className="font-heading text-3xl font-semibold text-slate-900">
						Components
					</h2>
					<p className="max-w-3xl text-slate-600">
						디자인 토큰을 적용한 핵심 UI 컴포넌트를 모아 페이지 제작 시 참조합니다.
					</p>
				</header>
				<Tabs defaultValue="buttons" className="space-y-6">
					<TabsList>
						<TabsTrigger value="buttons">Buttons</TabsTrigger>
						<TabsTrigger value="badges">Badges</TabsTrigger>
						<TabsTrigger value="forms">Forms</TabsTrigger>
						<TabsTrigger value="navigation">Tabs</TabsTrigger>
						<TabsTrigger value="table">Table</TabsTrigger>
					</TabsList>

					<TabsContent value="buttons" className="space-y-4">
						<p className="text-sm text-slate-600">
							버튼은 최소 높이 44px을 유지하며, 그림자는 shadow-soft 이상을 사용합니다.
						</p>
						<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
							{buttonShowcase.map((item) => (
								<Card
									key={item.label}
									className="border-none bg-white/85"
									style={{ boxShadow: "var(--shadow-soft)" }}
								>
									<CardHeader className="space-y-1">
										<CardTitle className="text-base text-slate-900">
											{item.label}
										</CardTitle>
										<CardDescription className="text-slate-600">
											{item.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Button variant={item.variant} size={item.size}>
											{item.text}
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="badges" className="space-y-4">
						<p className="text-sm text-slate-600">
							배지는 상태 정보를 명확하게 구분하고, 텍스트는 1~2단어로 간결하게 유지합니다.
						</p>
						<div className="grid gap-5 md:grid-cols-3">
							{badgeShowcase.map((item) => (
								<Card
									key={item.label}
									className="border-none bg-white/85"
									style={{ boxShadow: "var(--shadow-soft)" }}
								>
									<CardHeader className="space-y-1">
										<CardTitle className="text-base text-slate-900">
											{item.label}
										</CardTitle>
										<CardDescription className="text-slate-600">
											{item.description}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Badge variant={item.variant}>{item.text}</Badge>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					<TabsContent value="forms">
						<Card
							className="border-none bg-white/85"
							style={{ boxShadow: "var(--shadow-soft)" }}
						>
							<CardHeader className="space-y-2">
								<CardTitle className="text-xl text-slate-900">
									입학 상담 폼 베이스
								</CardTitle>
								<CardDescription className="text-slate-600">
									radius-xs와 space-sm 토큰으로 부드러운 곡선과 여유 있는 필드 간격을 확보합니다.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form className="grid gap-[var(--space-sm)] md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="parent-name">학부모 성함</Label>
										<Input id="parent-name" placeholder="홍길동" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="child-name">자녀 이름</Label>
										<Input id="child-name" placeholder="홍자람" />
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="contact">연락 가능한 전화번호</Label>
										<Input id="contact" placeholder="010-1234-5678" />
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="message">상담 요청 메모</Label>
										<Textarea
											id="message"
											placeholder="아이의 관심사나 궁금한 점을 적어주세요."
										/>
									</div>
									<div className="flex flex-wrap items-center gap-3 md:col-span-2">
										<Button type="submit" variant="default" size="lg">
											신청 완료하기
										</Button>
										<Button type="button" variant="ghost">
											상담 절차 안내 보기
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="navigation">
						<Card
							className="border-none bg-white/85"
							style={{ boxShadow: "var(--shadow-soft)" }}
						>
							<CardHeader className="space-y-2">
								<CardTitle className="text-xl text-slate-900">
									탭 내비게이션
								</CardTitle>
								<CardDescription className="text-slate-600">
									TabsList에는 space-2xs 패딩을, TabsTrigger에는 radius-xs와 shadow-soft를 적용합니다.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<Tabs defaultValue="overview" className="space-y-4">
									<TabsList>
										{navigationTabs.map((tab) => (
											<TabsTrigger key={tab.value} value={tab.value}>
												{tab.label}
											</TabsTrigger>
										))}
									</TabsList>
									{navigationTabs.map((tab) => (
										<TabsContent key={tab.value} value={tab.value}>
											<div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/90 p-[var(--space-md)] shadow-[var(--shadow-soft)]">
												<h3 className="font-heading text-xl text-[var(--brand-primary)]">
													{tab.title}
												</h3>
												<p className="mt-2 text-sm text-slate-600">{tab.copy}</p>
											</div>
										</TabsContent>
									))}
								</Tabs>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="table">
						<Card
							className="border-none bg-white/85"
							style={{ boxShadow: "var(--shadow-soft)" }}
						>
							<CardHeader className="space-y-2">
								<CardTitle className="text-xl text-slate-900">
									알림/이벤트 리스트
								</CardTitle>
								<CardDescription className="text-slate-600">
									테이블 컨테이너는 radius-md, space-sm 패딩을 적용합니다.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>제목</TableHead>
											<TableHead>상태</TableHead>
											<TableHead>일자</TableHead>
											<TableHead>대상</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{componentTableRows.map((row) => (
											<TableRow key={row.title}>
												<TableCell>{row.title}</TableCell>
												<TableCell>
													<Badge variant={row.status.variant}>
														{row.status.label}
													</Badge>
												</TableCell>
												<TableCell>{row.date}</TableCell>
												<TableCell>{row.audience}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								<p className="text-xs text-muted-foreground">
									열 간격은 space-sm, 행 높이는 최소 52px을 유지합니다.
								</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</section>
		</div>
	);
}

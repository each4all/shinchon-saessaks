import Link from "next/link";

import { CurriculumSidebar } from "@/components/curriculum/CurriculumSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { parentEducationTabs } from "@/data/curriculum";
import { listParentEducationPosts } from "@/lib/data/parent-education-repository";

type ParentEducationPageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ParentEducationPage({ searchParams }: ParentEducationPageProps) {
	const resolvedSearchParams = (await searchParams) ?? {};
	const session = await auth();
	const isApprovedParent = session?.user?.role === "parent" && session?.user?.status === "active";
	const isStaff = session?.user?.role === "admin" || session?.user?.role === "teacher";

	const tabParam = typeof resolvedSearchParams.tab === "string" ? resolvedSearchParams.tab : undefined;
	const tabKeys = parentEducationTabs.map((tab) => tab.key);
	const defaultTab = tabParam && tabKeys.includes(tabParam) ? tabParam : parentEducationTabs[0]?.key ?? "class";
	const searchQuery = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";
	const pageParam = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
	const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
	const limit = 10;
	const offset = (page - 1) * limit;

	const { items, total } = await listParentEducationPosts({
		category: "parent_recipe",
		search: searchQuery || null,
		limit,
		offset,
		publishedOnly: !isStaff,
	});

	const educationPosts = items.map((item, index) => ({
		id: item.id,
		slug: item.slug,
		rowNumber: total - offset - index,
		title: item.title,
		views: item.viewCount,
		publishAt: item.publishAt,
		isPublished: item.isPublished,
	}));

	const totalPages = Math.max(Math.ceil(total / limit), 1);

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육과정</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">부모교육</h1>
					<p className="text-sm text-muted-foreground">학부모교실과 부모레시피 콘텐츠를 한곳에서 찾아볼 수 있도록 정리했습니다.</p>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>교육과정</span>
						<span>/</span>
						<span>부모교육</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<CurriculumSidebar />
					<section className="rounded-[0.75rem] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
						<AccessNotice isApprovedParent={isApprovedParent} />

							<Tabs defaultValue={defaultTab} className="mt-8 w-full">
							<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
								<TabsList className="flex flex-wrap items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/85 px-3 py-2 shadow-[var(--shadow-soft)]">
									{parentEducationTabs.map((tab) => (
										<TabsTrigger
											key={tab.key}
											value={tab.key}
											className="min-w-[130px] rounded-[var(--radius-md)] border border-transparent px-3 py-1.5 text-sm font-semibold data-[state=active]:border-[var(--brand-primary)] data-[state=active]:bg-[var(--brand-mint)]/20"
										>
											{tab.label}
										</TabsTrigger>
									))}
								</TabsList>
								<div className="text-xs text-muted-foreground">
									탭을 전환하면 학부모교실, 부모교육 자료를 살펴볼 수 있습니다.
								</div>
							</div>

							<TabsContent value="class" className="mt-8">
								<section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/60 p-6 text-sm leading-relaxed text-muted-foreground">
									<h2 className="font-heading text-xl text-[var(--brand-navy)]">학부모교실 준비 중</h2>
									<p className="mt-2">
										교사와 학부모가 함께 모여 신앙/교육 이야기를 나누는 오프라인 클래스를 DB와 어드민에서 관리할
										수 있도록 개발하고 있습니다.
									</p>
									<ul className="mt-4 list-disc space-y-1 pl-5">
										<li>정기 일정·강의 주제·첨부 자료 업로드</li>
										<li>모임 참가 신청 및 출석 확인</li>
										<li>후속 자료(사진/요약) 공유</li>
									</ul>
									<p className="mt-4">
										요청 사항이나 참고할 자료가 있다면 <Link href="/member/login" className="underline">운영팀</Link>에
										전달해 주세요.
									</p>
								</section>
							</TabsContent>

							<TabsContent value="education" className="mt-8">
								<BoardSearchForm query={searchQuery} />
								<BoardTable isApprovedParent={isApprovedParent} posts={educationPosts} />
								<BoardPagination
									page={page}
									totalPages={totalPages}
									query={searchQuery}
								/>
							</TabsContent>
						</Tabs>
					</section>
				</div>
			</section>
		</div>
	);
}

function AccessNotice({ isApprovedParent }: { isApprovedParent: boolean }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--brand-primary)]/7 p-4 text-sm leading-relaxed text-[var(--brand-navy)]">
			<p className="font-semibold text-[var(--brand-primary)]">부모교육 열람 안내</p>
			<p className="mt-1 text-muted-foreground">
				부모교육 자료는 승인된 학부모 계정으로 로그인하면 전체 콘텐츠와 첨부 파일을 확인할 수 있습니다. 관리자
				콘솔에서 등록한 글이 실시간으로 반영됩니다.
			</p>
			{!isApprovedParent ? (
				<p className="mt-2 text-xs text-muted-foreground">
					아직 계정이 없거나 승인이 완료되지 않았다면 <Link href="/member/login" className="underline">로그인</Link> 또는{" "}
					<Link href="/member/register" className="underline">
						회원가입
					</Link>{" "}
					후 승인을 요청해 주세요.
				</p>
			) : (
				<p className="mt-2 text-xs text-muted-foreground">승인된 계정으로 접속 중입니다.</p>
			)}
		</div>
	);
}

function BoardSearchForm({ query }: { query: string }) {
	return (
		<form
			className="mb-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]"
			role="search"
			aria-label="부모교육 검색"
			method="get"
		>
			<input type="hidden" name="tab" value="education" />
			<div className="flex flex-col gap-3 sm:flex-row">
				<Input
					placeholder="제목 또는 키워드를 입력해 주세요."
					name="q"
					defaultValue={query}
					inputMode="search"
				/>
				<Button type="submit" className="min-w-[120px]">
					검색
				</Button>
			</div>
		</form>
	);
}

type TablePost = {
	id: string;
	slug: string;
	rowNumber: number | string;
	title: string;
	views: number;
	publishAt: Date | null;
	isPublished?: boolean;
};

function BoardTable({ isApprovedParent, posts }: { isApprovedParent: boolean; posts: TablePost[] }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-0 shadow-[var(--shadow-soft)]">
			<Table className="[&_th]:text-sm">
				<TableHeader>
					<TableRow>
						<TableHead className="w-[80px] text-center text-xs">번호</TableHead>
						<TableHead className="text-xs">제목</TableHead>
						<TableHead className="w-[90px] text-center text-xs">조회</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{posts.length === 0 ? (
						<TableRow>
							<TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
								등록된 부모교육 자료가 없습니다.
							</TableCell>
						</TableRow>
					) : (
						posts.map((post) => (
							<TableRow key={post.id}>
								<TableCell className="text-center text-sm font-semibold text-muted-foreground">
									{post.rowNumber}
								</TableCell>
								<TableCell className="text-sm font-medium">
									<Link
										href={`/education/parent-education/${post.slug}`}
										className="text-[var(--brand-primary)] underline-offset-4 hover:underline"
									>
										{post.title}
									</Link>
									{post.publishAt ? (
										<span className="ml-2 text-xs text-muted-foreground">
											({post.publishAt.toLocaleDateString("ko-KR")})
										</span>
									) : null}
									{!isApprovedParent ? (
										<span className="ml-2 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] text-muted-foreground">
											로그인 필요
										</span>
									) : null}
									{post.isPublished === false ? (
										<span className="ml-2 rounded-full border border-dashed border-amber-400 px-2 py-0.5 text-[11px] text-amber-700">
											초안
										</span>
									) : null}
								</TableCell>
								<TableCell className="text-center text-sm text-muted-foreground">
									{post.views.toLocaleString()}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
			<p className="border-t border-[var(--border)] px-4 py-3 text-xs text-muted-foreground">
				* 상세 본문과 첨부 파일은 로그인 후 열람할 수 있습니다.
			</p>
		</div>
	);
}

function buildPaginationUrl(page: number, query: string) {
	const params = new URLSearchParams();
	params.set("tab", "education");
	if (page > 1) {
		params.set("page", String(page));
	}
	if (query) {
		params.set("q", query);
	}
	return `/education/parent-education?${params.toString()}`;
}

function BoardPagination({ page, totalPages, query }: { page: number; totalPages: number; query: string }) {
	if (totalPages <= 1) {
		return null;
	}

	const pages = Array.from({ length: totalPages }).map((_, index) => index + 1);

	return (
		<div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
			<p>
				총 {totalPages} 페이지 · 현재 {page}페이지
			</p>
			<nav className="flex flex-wrap items-center gap-2" aria-label="부모교육 페이지네이션">
				{page === 1 ? (
					<Button variant="outline" size="sm" disabled>
						이전
					</Button>
				) : (
					<Button variant="outline" size="sm" asChild>
						<Link href={buildPaginationUrl(page - 1, query)}>이전</Link>
					</Button>
				)}
				{pages.map((pageNumber) =>
					pageNumber === page ? (
						<Button key={pageNumber} variant="default" size="sm" disabled>
							{pageNumber}
						</Button>
					) : (
						<Button key={pageNumber} variant="outline" size="sm" asChild>
							<Link href={buildPaginationUrl(pageNumber, query)}>{pageNumber}</Link>
						</Button>
					),
				)}
				{page === totalPages ? (
					<Button variant="outline" size="sm" disabled>
						다음
					</Button>
				) : (
					<Button variant="outline" size="sm" asChild>
						<Link href={buildPaginationUrl(page + 1, query)}>다음</Link>
					</Button>
				)}
			</nav>
		</div>
	);
}

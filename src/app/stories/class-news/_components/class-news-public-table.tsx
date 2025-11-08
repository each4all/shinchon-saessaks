"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Lock, LogIn } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { LoginModal } from "@/components/site/login-modal";
import type { ClassPostPreview } from "@/lib/data/class-posts-repository";

type ClassNewsPublicTableProps = {
	items: ClassPostPreview[];
	defaultLoginOpen?: boolean;
	redirectPath: string;
};

export function ClassNewsPublicTable({
	items,
	defaultLoginOpen = false,
	redirectPath,
}: ClassNewsPublicTableProps) {
	const [isLoginOpen, setIsLoginOpen] = useState(defaultLoginOpen);

	const hasItems = items.length > 0;

	const rows = useMemo(
		() =>
			items.map((item, index) => {
				const published = item.publishAt ?? item.createdAt;
				const formattedDate = new Intl.DateTimeFormat("ko-KR", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}).format(published);

				return {
					displayIndex: items.length - index,
					formattedDate,
					...item,
				};
			}),
		[items],
	);

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-4 py-4 text-xs text-muted-foreground">
					<div className="flex items-center gap-2">
						<Lock className="h-4 w-4 text-[var(--brand-primary)]" aria-hidden />
						<span>
							반별 게시글은 로그인 후 열람 가능합니다. 목록은 최근 게시 순으로 최대 12건까지 보여줍니다.
						</span>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
						onClick={() => setIsLoginOpen(true)}
					>
						<LogIn className="mr-1 h-3.5 w-3.5" aria-hidden />
						로그인하고 전체 보기
					</Button>
				</div>

				{hasItems ? (
					<Table>
						<TableCaption className="px-4 text-left text-xs text-muted-foreground">
							제목을 선택하면 로그인 창이 열립니다. 승인된 학부모/교직원은 로그인을 완료하면 바로 학부모 포털로 이동합니다.
						</TableCaption>
						<TableHeader className="bg-[rgba(241,239,255,0.7)]">
							<TableRow className="text-xs uppercase tracking-[0.18em] text-[var(--brand-navy)]/70">
								<TableHead className="w-16 text-center">No.</TableHead>
								<TableHead className="w-32 text-center">반</TableHead>
								<TableHead>제목</TableHead>
								<TableHead className="w-40 text-center">게시일</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<TableRow key={row.id} className="align-top">
									<TableCell className="text-center text-sm text-muted-foreground">{row.displayIndex}</TableCell>
									<TableCell className="text-center text-sm font-medium text-[var(--brand-navy)]">
										{row.classroomName ?? "반 미지정"}
									</TableCell>
									<TableCell className="py-4 text-sm">
										<button
											type="button"
											onClick={() => setIsLoginOpen(true)}
											className="text-left text-[var(--brand-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
										>
											{row.title}
										</button>
										{row.summary ? (
											<p className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground">{row.summary}</p>
										) : null}
									</TableCell>
									<TableCell className="text-center text-sm text-muted-foreground">{row.formattedDate}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white/80 px-4 py-12 text-center text-sm text-muted-foreground">
						전체 공개 범위로 게시된 반 소식이 아직 없습니다. 로그인 후 학부모 포털에서 더 많은 소식을 확인하실 수 있습니다.
					</p>
				)}
			</div>

			<section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/85 px-6 py-6 text-sm text-muted-foreground shadow-[var(--shadow-soft)] sm:grid-cols-2">
				<div className="flex items-start gap-3">
					<CalendarDays className="mt-1 h-5 w-5 text-[var(--brand-primary)]" aria-hidden />
					<div>
						<h3 className="font-semibold text-[var(--brand-navy)]">학부모 포털 이용 안내</h3>
						<p className="mt-1 leading-relaxed">
							승인된 보호자는 로그인 후 반별 갤러리, 학사 일정, 급식표 등 맞춤 콘텐츠를 확인할 수 있습니다. 계정이 없다면 원으로
							문의해 주세요.
						</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<Badge variant="outline" className="mt-1">
						Privacy
					</Badge>
					<p className="leading-relaxed">
						아이들의 사진과 자세한 활동 기록은 보호자 전용으로 제공됩니다. 안전한 열람을 위해 로그인 후 이용 부탁드립니다.
					</p>
				</div>
			</section>

			<LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} redirectTo={redirectPath} />
		</>
	);
}

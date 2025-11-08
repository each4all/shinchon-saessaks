import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { getMealPlans, getNutritionBulletins } from "@/lib/data/meal-plans-repository";

import { CreateMealPlanForm } from "./_components/create-meal-plan-form";
import { CreateNutritionBulletinForm } from "./_components/create-nutrition-bulletin-form";
import { DeleteMealPlanButton } from "./_components/delete-meal-plan-button";
import { NutritionBulletinItem } from "./_components/nutrition-bulletin-item";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
}

export default async function AdminMealsPage() {
	const session = await auth();
	const role = session?.user?.role ?? "guest";
	const isNutrition = role === "nutrition" || role === "admin";

	const today = new Date();
	const monthAhead = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 30);
	const mealPlans = await getMealPlans({ from: today, to: monthAhead, limit: 120 });
	const bulletins = await getNutritionBulletins({ includeDrafts: isNutrition, limit: 50 });

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-secondary)]">Admin Console</p>
					<h1 className="font-heading text-[clamp(2rem,3vw,2.75rem)] leading-tight">급식 · 영양 관리</h1>
					<p className="text-sm text-muted-foreground">
						월별 급식표와 알레르기 정보를 관리하고 학부모 포털에 공유합니다.
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/admin">대시보드로 돌아가기</Link>
				</Button>
			</div>

			{isNutrition ? <CreateMealPlanForm role={role} /> : null}

			<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold">등록된 급식 정보</h2>
						<p className="text-sm text-muted-foreground">주요 식단과 첨부 자료가 날짜 순으로 정렬됩니다.</p>
					</div>
					<Badge variant="outline">총 {mealPlans.length}건</Badge>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>날짜</TableHead>
							<TableHead>식단 유형</TableHead>
							<TableHead>메뉴</TableHead>
							<TableHead>알레르기</TableHead>
							<TableHead>첨부</TableHead>
							<TableHead className="text-right">관리</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mealPlans.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
									등록된 급식 정보가 없습니다.
								</TableCell>
							</TableRow>
						) : (
							mealPlans.map((plan) => (
								<TableRow key={plan.id}>
									<TableCell className="text-sm font-medium">{formatDate(plan.menuDate)}</TableCell>
									<TableCell className="text-sm capitalize">{plan.mealType}</TableCell>
									<TableCell className="max-w-[260px] whitespace-pre-line text-sm">
										{plan.menuItems.join("\n")}
										{plan.notes ? <span className="mt-2 block text-xs text-muted-foreground">{plan.notes}</span> : null}
					<span className="mt-2 block text-xs text-muted-foreground">
						공개 범위: {plan.audienceScope === "parents" ? "학부모" : plan.audienceScope === "staff" ? "교직원" : "전체"}
					</span>
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										{plan.allergens.length > 0 ? plan.allergens.join(", ") : "-"}
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										{plan.resources.length === 0 ? (
											<span>-</span>
										) : (
											<ul className="space-y-1">
												{plan.resources.map((resource) => (
													<li key={resource.id}>
														<Link
															href={resource.fileUrl}
															target="_blank"
															className="text-[var(--brand-primary)] underline-offset-4 hover:underline"
														>
															{resource.label ?? "첨부"}
														</Link>
													</li>
												))}
											</ul>
										)}
									</TableCell>
									<TableCell className="text-right">
										{isNutrition ? (
											<div className="flex flex-wrap justify-end gap-2">
												<Button variant="outline" size="sm" asChild>
													<Link href={`/admin/meals/${plan.id}/edit`}>수정</Link>
												</Button>
												<DeleteMealPlanButton planId={plan.id} />
											</div>
										) : null}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</section>

			{isNutrition ? <CreateNutritionBulletinForm role={role} /> : null}

			<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold">영양 게시물</h2>
						<p className="text-sm text-muted-foreground">영양사 노트, 알레르기 공지, 식단 보고서를 관리합니다.</p>
					</div>
					<Badge variant="outline">총 {bulletins.length}건</Badge>
				</div>

				<div className="mt-4 grid gap-4">
					{bulletins.length === 0 ? (
						<p className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white/70 px-4 py-8 text-center text-sm text-muted-foreground">
							등록된 영양 게시물이 없습니다.
						</p>
					) : (
						bulletins.map((bulletin) => (
							<NutritionBulletinItem key={bulletin.id} bulletin={bulletin} canManage={isNutrition} />
						))
					)}
				</div>
			</section>
		</div>
	);
}

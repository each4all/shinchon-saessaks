import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getMealPlan } from "@/lib/data/meal-plans-repository";

import { EditMealPlanForm, type MealPlanFormValues } from "../../_components/create-meal-plan-form";

type EditMealPlanPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditMealPlanPage({ params }: EditMealPlanPageProps) {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/member/login?redirect=/admin/meals");
	}

	const role = session.user.role ?? "guest";
	if (role !== "admin" && role !== "nutrition") {
		redirect("/admin");
	}

	const { id } = await params;
	const mealPlan = await getMealPlan(id);
	if (!mealPlan) {
		notFound();
	}

	const initialValues: MealPlanFormValues = {
		planId: mealPlan.id,
		menuDate: mealPlan.menuDate.toISOString().slice(0, 10),
		mealType: mealPlan.mealType,
		menuItems: mealPlan.menuItems,
		allergens: mealPlan.allergens,
		notes: mealPlan.notes ?? "",
		audienceScope: mealPlan.audienceScope,
		attachments: mealPlan.resources.map((resource) => ({
			label: resource.label ?? "",
			url: resource.fileUrl,
		})),
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-secondary)]">Admin Console</p>
					<h1 className="font-heading text-[clamp(2rem,3vw,2.75rem)] leading-tight">급식 정보 수정</h1>
					<p className="text-sm text-muted-foreground">등록된 급식표를 수정하고 학부모/교직원 페이지를 최신으로 유지하세요.</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/admin/meals">목록으로 돌아가기</Link>
				</Button>
			</div>

			<EditMealPlanForm role={role} initialValues={initialValues} />
		</div>
	);
}

"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { CalendarDays, Globe, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createMealPlanAction, updateMealPlanAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

const MAX_ATTACHMENTS = 3;

type MealPlanAttachment = {
	label?: string | null;
	url?: string | null;
};

type MealPlanFormValues = {
	planId?: string;
	menuDate?: string;
	mealType?: string;
	menuItems?: string[];
	allergens?: string[];
	notes?: string | null;
	audienceScope?: string;
	attachments?: MealPlanAttachment[];
};

type MealPlanFormProps = {
	role?: string;
	mode: "create" | "edit";
	initialValues?: MealPlanFormValues;
};

function toInputDate(value?: string) {
	if (!value) return new Date().toISOString().slice(0, 10);
	return value;
}

function toMenuItemsText(menuItems?: string[]) {
	return menuItems && menuItems.length > 0 ? menuItems.join("\n") : "";
}

function toAllergensText(allergens?: string[]) {
	return allergens && allergens.length > 0 ? allergens.join(", ") : "";
}

function normalizeAttachments(initial?: MealPlanAttachment[]) {
	const values = initial ?? [];
	return Array.from({ length: MAX_ATTACHMENTS }).map((_, index) => values[index] ?? { label: "", url: "" });
}

function MealPlanForm({ role = "admin", mode, initialValues }: MealPlanFormProps) {
	const action = mode === "create" ? createMealPlanAction : updateMealPlanAction;
	const [formState, formAction, pending] = useActionState<FormState, FormData>(action, initialFormState);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (formState.status === "success" && mode === "create") {
			formRef.current?.reset();
		}
	}, [formState.status, mode]);

	const attachments = useMemo(() => normalizeAttachments(initialValues?.attachments), [initialValues?.attachments]);

	const heading = mode === "create" ? "급식 정보 등록" : "급식 정보 수정";
	const submitLabel = mode === "create" ? "등록" : "변경 사항 저장";
	const helperText =
		mode === "create"
			? "일자별 급식 메뉴와 알레르기 정보를 입력하세요. 첨부 자료(PDF, 이미지)를 함께 등록할 수 있습니다."
			: "등록된 급식 정보를 수정하고 저장하세요.";
	const audienceDefaultFromRole =
		role === "nutrition" || role === "admin" ? "all" : role === "staff" ? "staff" : "parents";
	const defaultAudienceScope = initialValues?.audienceScope ?? audienceDefaultFromRole;

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold text-[var(--brand-navy)]">{heading}</h2>
				<p className="text-sm text-muted-foreground">{helperText}</p>
			</div>

			<form ref={formRef} action={formAction} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				{mode === "edit" && initialValues?.planId ? <input type="hidden" name="planId" value={initialValues.planId} /> : null}
				<div className="grid gap-4 min-w-0">
					<div className="grid gap-2">
						<Label htmlFor="menuDate">날짜</Label>
						<Input
							id="menuDate"
							name="menuDate"
							type="date"
							required
							defaultValue={toInputDate(initialValues?.menuDate)}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="menuItems">메뉴</Label>
						<textarea
							id="menuItems"
							name="menuItems"
							required
							defaultValue={toMenuItemsText(initialValues?.menuItems)}
							className="min-h-[140px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--brand-navy)]"
							placeholder={"줄마다 하나씩 메뉴를 입력하세요.\n예) 잡곡밥\n예) 미소된장국\n예) 계절과일"}
						/>
						<p className="text-xs text-muted-foreground">줄바꿈으로 각 메뉴를 구분합니다.</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="notes">특이 사항 (선택)</Label>
						<textarea
							id="notes"
							name="notes"
							defaultValue={initialValues?.notes ?? ""}
							className="min-h-[80px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--brand-navy)]"
							placeholder="보충 설명이나 안내문을 입력하세요."
						/>
					</div>
				</div>

				<div className="grid gap-4 min-w-0">
					<div className="grid gap-2">
						<Label htmlFor="mealType">식단 유형</Label>
						<select
							id="mealType"
							name="mealType"
							defaultValue={initialValues?.mealType ?? "lunch"}
							className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						>
							<option value="breakfast">조식</option>
							<option value="lunch">중식</option>
							<option value="dinner">석식</option>
							<option value="snack">간식</option>
							<option value="other">기타</option>
						</select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="allergens">알레르기 (선택)</Label>
						<Input
							id="allergens"
							name="allergens"
							defaultValue={toAllergensText(initialValues?.allergens)}
							placeholder="쉼표(,)로 구분 (예: 계란, 우유, 대두)"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="audienceScope">공개 범위</Label>
						<select
							id="audienceScope"
							name="audienceScope"
							defaultValue={defaultAudienceScope}
							className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						>
							<option value="parents">학부모</option>
							<option value="staff">교직원 전용</option>
							<option value="all">전체 공개 (퍼블릭 + 학부모)</option>
						</select>
						<p className="text-xs text-muted-foreground">
							전체 공개로 설정하면 퍼블릭 `/meals` 페이지와 학부모 포털에 동시에 노출됩니다.
						</p>
					</div>

					<div className="grid gap-2">
						<span className="text-sm font-medium text-[var(--brand-navy)]">첨부 자료 (선택)</span>
						<div className="grid gap-3 min-w-0">
							{attachments.map((attachment, index) => (
								<div
									key={index}
									className="grid gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[rgba(248,247,255,0.6)] p-3"
								>
									<div className="grid gap-1">
										<Label htmlFor={`attachmentLabel-${index}`} className="text-xs">
											첨부 {index + 1} 제목
										</Label>
										<Input
											id={`attachmentLabel-${index}`}
											name="attachmentLabel"
											defaultValue={attachment.label ?? ""}
											placeholder="예) 식단표 PDF"
										/>
									</div>
									<div className="grid gap-1">
										<Label htmlFor={`attachmentUrl-${index}`} className="text-xs">
											첨부 {index + 1} URL
										</Label>
										<Input
											id={`attachmentUrl-${index}`}
											name="attachmentUrl"
											defaultValue={attachment.url ?? ""}
											placeholder="https://..."
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="grid gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[rgba(241,248,255,0.6)] p-4 text-xs text-muted-foreground">
						<div className="flex items-center justify-between text-[var(--brand-navy)]">
							<strong className="text-sm font-semibold">프런트 노출 예시</strong>
							<span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">/parents/meals · /meals</span>
						</div>
						<div className="rounded-[var(--radius-sm)] border border-[rgba(0,121,193,0.18)] bg-white px-4 py-3 text-[var(--brand-navy)] shadow-[var(--shadow-soft)]">
							<div className="flex items-center justify-between text-[11px] text-muted-foreground">
								<span className="inline-flex items-center gap-1 font-medium text-[var(--brand-navy)]">
									<Utensils className="h-3 w-3" aria-hidden />
									중식
								</span>
								<span className="inline-flex items-center gap-1">
									<CalendarDays className="h-3 w-3" aria-hidden />
									2025.03.12
								</span>
							</div>
							<ul className="mt-2 space-y-1 text-xs leading-snug text-muted-foreground">
								<li>잡곡밥</li>
								<li>야채계란국</li>
								<li>두부조림 · 계절과일</li>
							</ul>
							<p className="mt-2 text-xs leading-snug text-muted-foreground">
								특이 사항: 알레르기 1·5·6번 포함 — 우유, 대두 성분 안내
							</p>
							<div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
								<span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2 py-1">
									<Globe className="h-3 w-3" aria-hidden />
									전체 공개
								</span>
								<span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2 py-1">
									📎 첨부 1
								</span>
							</div>
						</div>
						<ul className="space-y-1 text-[11px] leading-relaxed">
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">메뉴</strong> → 퍼블릭 달력/카드와 학부모 달력에 그대로 표기
							</li>
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">알레르기</strong> → 학부모 포털 카드의 경고 문구로 노출
							</li>
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">특이 사항</strong> → 상세 패널 우측 메모 영역에 표시
							</li>
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">공개 범위</strong> → 퍼블릭(`all`) 또는 학부모 전용(`parents`) 선택
							</li>
						</ul>
					</div>
				</div>

				<div className="md:col-span-2 flex flex-col gap-3">
					{formState.status === "error" ? (
						<div className="rounded-[var(--radius-sm)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
							<p className="font-semibold">{formState.message ?? "저장에 실패했습니다."}</p>
							{formState.issues ? (
								<ul className="mt-2 list-disc space-y-1 pl-4">
									{formState.issues.map((issue) => (
										<li key={issue}>{issue}</li>
									))}
								</ul>
							) : null}
						</div>
					) : null}

					{formState.status === "success" ? (
						<div className="rounded-[var(--radius-sm)] border border-emerald-300/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
							{formState.message ?? "저장되었습니다."}
						</div>
					) : null}

					<div className="flex flex-wrap items-center gap-3">
						<Button type="submit" disabled={pending}>
							{pending ? "처리 중..." : submitLabel}
						</Button>
						<span className="text-xs text-muted-foreground">
							저장 후 학부모/교직원 급식 페이지가 즉시 갱신됩니다.
						</span>
					</div>
				</div>
			</form>
		</section>
	);
}

type CreateMealPlanFormProps = {
	role?: string;
};

export function CreateMealPlanForm({ role = "admin" }: CreateMealPlanFormProps) {
	return <MealPlanForm role={role} mode="create" />;
}

type EditMealPlanFormProps = {
	role?: string;
	initialValues: MealPlanFormValues;
};

export function EditMealPlanForm({ role = "admin", initialValues }: EditMealPlanFormProps) {
	return <MealPlanForm role={role} mode="edit" initialValues={initialValues} />;
}

export type { MealPlanFormValues };

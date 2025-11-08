"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createNutritionBulletinAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

type CreateNutritionBulletinFormProps = {
	role?: string;
};

function toDateTimeLocal(value?: string) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (num: number) => String(num).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateNutritionBulletinForm({ role = "admin" }: CreateNutritionBulletinFormProps) {
	const [formState, formAction, pending] = useActionState<FormState, FormData>(createNutritionBulletinAction, initialFormState);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (formState.status === "success") {
			formRef.current?.reset();
		}
	}, [formState.status]);

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold text-[var(--brand-navy)]">영양 게시물 작성</h2>
				<p className="text-sm text-muted-foreground">
					식품 위생 안내, 영양 팁, 알레르기 공지를 게시하세요. 게시 상태를 선택하면 학부모 포털이 즉시 갱신됩니다.
				</p>
			</div>

			<form ref={formRef} action={formAction} className="mt-6 grid gap-5">
				<div className="grid gap-2">
					<Label htmlFor="title">제목</Label>
					<Input id="title" name="title" placeholder="예) 11월 알레르기 주의 식단 안내" required />
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="grid gap-2">
						<Label htmlFor="category">카테고리</Label>
						<select
							id="category"
							name="category"
							defaultValue="bulletin"
							className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						>
							<option value="bulletin">영양 소식</option>
							<option value="report">보고서</option>
							<option value="menu_plan">식단 계획</option>
						</select>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="status">상태</Label>
						<select
							id="status"
							name="status"
							defaultValue={role === "nutrition" ? "draft" : "draft"}
							className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						>
							<option value="draft">초안</option>
							<option value="published">게시</option>
							<option value="archived">보관</option>
						</select>
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="publishAt">게시 예정일 (선택)</Label>
					<input
						id="publishAt"
						name="publishAt"
						type="datetime-local"
						defaultValue={toDateTimeLocal()}
						className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="content">내용</Label>
					<textarea
						id="content"
						name="content"
						required
						className="min-h-[160px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--brand-navy)]"
						placeholder={"학부모에게 전달할 영양 정보를 입력하세요.\n예) 11월 알레르기 주의 식단 안내 및 대체식 제공 방법"}
					/>
				</div>

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
						{formState.message ?? "등록되었습니다."}
					</div>
				) : null}

				<div className="flex flex-wrap items-center gap-3">
					<Button type="submit" disabled={pending}>
						{pending ? "등록 중..." : "등록"}
					</Button>
					<span className="text-xs text-muted-foreground">
						게시 상태가 `게시`이면 학부모 포털에 즉시 노출됩니다.
					</span>
				</div>
			</form>
		</section>
	);
}

"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createParentEducationPostAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

const categories = [
	{ key: "parent_recipe", label: "부모레시피" },
	{ key: "parent_class", label: "학부모교실" },
	{ key: "seminar", label: "세미나/특강" },
] as const;

export function CreateParentEducationForm() {
	const formRef = useRef<HTMLFormElement>(null);
	const [formState, formAction, pending] = useActionState<FormState, FormData>(
		createParentEducationPostAction,
		initialFormState,
	);

	useEffect(() => {
		if (formState.status === "success") {
			formRef.current?.reset();
		}
	}, [formState.status]);

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
			<div className="space-y-2">
				<h2 className="text-xl font-semibold text-[var(--brand-navy)]">부모교육 새 글 작성</h2>
				<p className="text-sm text-muted-foreground">
					부모레시피/세미나 자료를 등록하면 부모교육 페이지와 API에서 바로 확인할 수 있습니다.
				</p>
			</div>
			<form ref={formRef} action={formAction} className="mt-6 grid gap-5">
				<div className="grid gap-2">
					<Label htmlFor="title">제목</Label>
					<Input id="title" name="title" placeholder="부모레시피15-000" required />
				</div>

				<div className="grid gap-2">
					<Label htmlFor="slug">슬러그 (선택)</Label>
					<Input id="slug" name="slug" placeholder="parent-recipe-15" />
					<p className="text-xs text-muted-foreground">미입력 시 자동으로 생성됩니다.</p>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="category">카테고리</Label>
					<select
						id="category"
						name="category"
						className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						defaultValue="parent_recipe"
					>
						{categories.map((category) => (
							<option key={category.key} value={category.key}>
								{category.label}
							</option>
						))}
					</select>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="summary">요약</Label>
					<Input id="summary" name="summary" placeholder="짧은 요약을 입력해 주세요." />
				</div>

				<div className="grid gap-2">
					<Label htmlFor="content">본문 (선택)</Label>
					<textarea
						id="content"
						name="content"
						rows={5}
						className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--brand-navy)]"
						placeholder="본문 또는 링크를 입력해 주세요."
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="audienceScope">공개 범위</Label>
					<select
						id="audienceScope"
						name="audienceScope"
						defaultValue="parents"
						className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
					>
						<option value="parents">학부모 전용</option>
						<option value="staff">교직원</option>
					</select>
				</div>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="publishNow"
						name="publishNow"
						className="size-4 rounded border border-[var(--border)] accent-[var(--brand-primary)]"
					/>
					<Label htmlFor="publishNow" className="text-sm font-medium text-[var(--brand-navy)]">
						바로 게시
					</Label>
				</div>

				<div className="flex flex-col gap-2 text-sm">
					<Button type="submit" disabled={pending}>
						{pending ? "저장 중..." : "부모교육 글 저장"}
					</Button>
					{formState.status !== "idle" ? (
						<p className={formState.status === "success" ? "text-emerald-600" : "text-destructive"}>
							{formState.message}
						</p>
					) : null}
				</div>
			</form>
		</section>
	);
}

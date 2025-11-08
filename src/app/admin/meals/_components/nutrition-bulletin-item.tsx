"use client";

import { useActionState, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NutritionBulletin } from "@/lib/data/meal-plans-repository";

import { updateNutritionBulletinAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";
import { DeleteNutritionBulletinButton } from "./delete-nutrition-bulletin-button";
import { UpdateNutritionBulletinStatusButton } from "./update-nutrition-bulletin-status-button";

const STATUS_LABEL: Record<string, string> = {
	draft: "초안",
	published: "게시",
	archived: "보관",
};

const STATUS_BADGE_VARIANT: Record<string, "outline" | "success" | "secondary"> = {
	draft: "outline",
	published: "success",
	archived: "secondary",
};

const CATEGORY_LABEL: Record<string, string> = {
	bulletin: "영양 소식",
	report: "보고서",
	menu_plan: "식단 계획",
};

function toDateTimeLocal(date?: Date | null) {
	if (!date) return "";
	const pad = (num: number) => String(num).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(date?: Date | null) {
	if (!date) return "-";
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

type NutritionBulletinItemProps = {
	bulletin: NutritionBulletin;
	canManage?: boolean;
};

export function NutritionBulletinItem({ bulletin, canManage = false }: NutritionBulletinItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [formState, formAction, pending] = useActionState<FormState, FormData>(updateNutritionBulletinAction, initialFormState);

	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-5 shadow-[var(--shadow-soft)]">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">{CATEGORY_LABEL[bulletin.category] ?? bulletin.category}</Badge>
						<Badge variant={STATUS_BADGE_VARIANT[bulletin.status] ?? "outline"}>
							{STATUS_LABEL[bulletin.status] ?? bulletin.status}
						</Badge>
					</div>
					<h3 className="text-lg font-semibold text-[var(--brand-navy)]">{bulletin.title}</h3>
					<p className="text-xs text-muted-foreground">
						게시일: {formatDate(bulletin.publishAt)} · 수정 {formatDate(bulletin.updatedAt)}
					</p>
				</div>
				{canManage ? (
					<Button variant="ghost" size="sm" onClick={() => setIsEditing((prev) => !prev)}>
						{isEditing ? "편집 닫기" : "편집"}
					</Button>
				) : null}
			</div>

			{isEditing ? (
				<form action={formAction} className="mt-5 grid gap-4">
					<input type="hidden" name="bulletinId" value={bulletin.id} />
					<div className="grid gap-2">
						<Label htmlFor={`title-${bulletin.id}`}>제목</Label>
						<Input id={`title-${bulletin.id}`} name="title" defaultValue={bulletin.title} required />
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor={`category-${bulletin.id}`}>카테고리</Label>
							<select
								id={`category-${bulletin.id}`}
								name="category"
								defaultValue={bulletin.category}
								className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
							>
								<option value="bulletin">영양 소식</option>
								<option value="report">보고서</option>
								<option value="menu_plan">식단 계획</option>
							</select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor={`status-${bulletin.id}`}>상태</Label>
							<select
								id={`status-${bulletin.id}`}
								name="status"
								defaultValue={bulletin.status}
								className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
							>
								<option value="draft">초안</option>
								<option value="published">게시</option>
								<option value="archived">보관</option>
							</select>
						</div>
					</div>

					<div className="grid gap-2">
						<Label htmlFor={`publishAt-${bulletin.id}`}>게시 예정일 (선택)</Label>
						<input
							id={`publishAt-${bulletin.id}`}
							name="publishAt"
							type="datetime-local"
							defaultValue={toDateTimeLocal(bulletin.publishAt ?? undefined)}
							className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor={`content-${bulletin.id}`}>내용</Label>
						<textarea
							id={`content-${bulletin.id}`}
							name="content"
							defaultValue={bulletin.content}
							required
							className="min-h-[160px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--brand-navy)]"
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
							{formState.message ?? "수정되었습니다."}
						</div>
					) : null}

					<div className="flex flex-wrap items-center gap-3">
						<Button type="submit" disabled={pending}>
							{pending ? "저장 중..." : "저장"}
						</Button>
						<Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
							취소
						</Button>
					</div>
				</form>
			) : (
				<p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{bulletin.content}</p>
			)}

			{canManage ? (
				<div className="mt-6 flex flex-wrap items-center gap-2">
					{bulletin.status !== "published" ? (
						<UpdateNutritionBulletinStatusButton bulletinId={bulletin.id} status="published" variant="default">
							게시
						</UpdateNutritionBulletinStatusButton>
					) : (
						<UpdateNutritionBulletinStatusButton bulletinId={bulletin.id} status="draft">
							초안으로
						</UpdateNutritionBulletinStatusButton>
					)}
					{bulletin.status !== "archived" ? (
						<UpdateNutritionBulletinStatusButton
							bulletinId={bulletin.id}
							status="archived"
							variant="ghost"
							confirmMessage="해당 영양 게시물을 보관 처리하시겠습니까?"
						>
							보관
						</UpdateNutritionBulletinStatusButton>
					) : null}
					<DeleteNutritionBulletinButton bulletinId={bulletin.id} />
				</div>
			) : null}
		</div>
	);
}

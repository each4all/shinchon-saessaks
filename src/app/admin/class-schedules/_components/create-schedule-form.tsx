"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Classroom } from "@/lib/data/class-posts-repository";

import { createScheduleAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

type CreateScheduleFormProps = {
	classrooms: Classroom[];
	role?: string;
	disabled?: boolean;
};

export function CreateScheduleForm({ classrooms, role = "admin", disabled = false }: CreateScheduleFormProps) {
	const [formState, formAction, pending] = useActionState<FormState, FormData>(createScheduleAction, initialFormState);
	const formRef = useRef<HTMLFormElement>(null);
	const [imageFields, setImageFields] = useState<string[]>([""]);

	useEffect(() => {
		if (formState.status === "success" && !disabled) {
			formRef.current?.reset();
			startTransition(() => {
				setImageFields([""]);
			});
		}
	}, [formState.status, disabled]);

	const handleImageChange = (index: number, value: string) => {
		setImageFields((prev) => prev.map((field, idx) => (idx === index ? value : field)));
	};

	const addImageField = () => {
		setImageFields((prev) => [...prev, ""]);
	};

	const removeImageField = (index: number) => {
		setImageFields((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index)));
	};

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold text-[var(--brand-navy)]">일정 등록</h2>
				<p className="text-sm text-muted-foreground">
					월간 행사, 방문 수업, 운영위원회 등 일정을 등록하세요. 교사는 담당 반 일정만 등록할 수 있습니다.
				</p>
				{disabled ? (
					<p className="rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
						담당 반이 배정되어야 새 일정을 등록할 수 있습니다. 관리자에게 문의해 주세요.
					</p>
				) : null}
			</div>
			<form ref={formRef} action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
				<div className="grid gap-2">
					<Label htmlFor="classroomId">대상 반</Label>
					<select
						id="classroomId"
						name="classroomId"
						className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						disabled={disabled}
						required={role === "teacher"}
					>
						<option value="">{role === "teacher" ? "담당 반만 선택 가능" : "전체"}</option>
						{classrooms.map((classroom) => (
							<option key={classroom.id} value={classroom.id}>
								{classroom.name}
							</option>
						))}
					</select>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="title">제목</Label>
					<Input id="title" name="title" placeholder="예) 11월 운영위원회" required disabled={disabled} />
				</div>

				<div className="grid gap-2">
					<Label htmlFor="description">설명</Label>
					<Input id="description" name="description" placeholder="간단한 설명" disabled={disabled} />
				</div>

				<div className="grid gap-2">
					<Label htmlFor="location">장소</Label>
					<Input id="location" name="location" placeholder="예) 본관 2층 회의실" disabled={disabled} />
				</div>

				<div className="grid gap-2">
					<Label htmlFor="eventType">행사 유형</Label>
					<select
						id="eventType"
						name="eventType"
						defaultValue="other"
						className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						disabled={disabled}
					>
						<option value="notice">공지</option>
						<option value="field_trip">체험학습/야외활동</option>
						<option value="workshop">워크숍/방문수업</option>
						<option value="holiday">휴일/휴원</option>
						<option value="other">기타</option>
					</select>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="audienceScope">공개 범위</Label>
					<select
						id="audienceScope"
						name="audienceScope"
						defaultValue="parents"
						className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						disabled={disabled}
					>
						<option value="parents">학부모</option>
						<option value="all">전체 공개</option>
						<option value="staff">교직원 전용</option>
					</select>
				</div>

				<div className="grid gap-2">
					{role === "teacher" ? (
						<>
							<span className="text-sm font-medium text-[var(--brand-navy)]">상태</span>
							<input type="hidden" name="status" value="draft" />
							<p className="rounded-[var(--radius-sm)] border border-[var(--border)]/60 bg-[rgba(241,239,255,0.6)] px-3 py-2 text-xs text-muted-foreground">
								교사가 등록한 일정은 초안으로 저장되며, 관리자가 게시 승인 후 학부모에게 노출됩니다.
							</p>
						</>
					) : (
						<>
							<Label htmlFor="status">상태</Label>
							<select
								id="status"
								name="status"
								defaultValue="published"
								className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
								disabled={disabled}
							>
								<option value="draft">초안</option>
								<option value="published">게시</option>
								<option value="cancelled">취소</option>
							</select>
						</>
					)}
				</div>

				<div className="grid gap-2">
					<Label htmlFor="startDate">시작일시</Label>
					<input
						id="startDate"
						name="startDate"
						type="datetime-local"
						required
						className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						disabled={disabled}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="endDate">종료일시 (선택)</Label>
					<input
						id="endDate"
						name="endDate"
						type="datetime-local"
						className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						disabled={disabled}
					/>
				</div>

				<div className="md:col-span-2 flex flex-col gap-4">
					<div className="grid gap-2">
						<Label>행사 갤러리 이미지 (선택)</Label>
						<p className="text-xs text-muted-foreground">
							이미지 URL을 붙여넣으면 우리들 이야기 &gt; 교육행사 갤러리에 표시됩니다. /images/events/ 경로나 외부 URL 모두 사용할 수 있습니다.
						</p>
						<div className="space-y-2">
							{imageFields.map((value, idx) => (
								<div key={`image-field-${idx}`} className="flex gap-2">
									<Input
										type="url"
										name="imageUrls"
										placeholder="예) /images/events/family-sports-2025/1761297789_232468.jpg"
										value={value}
										onChange={(event) => handleImageChange(idx, event.target.value)}
										disabled={disabled}
									/>
									{imageFields.length > 1 ? (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => removeImageField(idx)}
											disabled={disabled}
										>
											<span aria-hidden>×</span>
											<span className="sr-only">이미지 입력 제거</span>
										</Button>
									) : null}
								</div>
							))}
						</div>
						<Button type="button" variant="outline" size="sm" onClick={addImageField} disabled={disabled}>
							이미지 입력 추가
						</Button>
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
						<Button type="submit" disabled={pending || disabled}>
							{pending ? "등록 중..." : "등록"}
						</Button>
						<span className="text-xs text-muted-foreground">등록 후 학부모 포털 일정이 갱신됩니다.</span>
					</div>
				</div>
			</form>
		</section>
	);
}

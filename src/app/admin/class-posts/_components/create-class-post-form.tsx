"use client";

import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Globe2, ImageIcon, LockKeyhole, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Classroom } from "@/lib/data/class-posts-repository";

import { createClassPostAction, updateClassPostAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";
import { RichTextEditor } from "../../_components/rich-text-editor";

const MAX_ATTACHMENTS = 3;

type ClassPostFormValues = {
	postId?: string;
	classroomId?: string;
	title?: string;
	summary?: string | null;
	publishAt?: string | null;
	contentMarkdown?: string;
	attachments?: { label?: string | null; url?: string | null }[];
	audienceScope?: string;
};

type ClassPostFormProps = {
	classrooms: Classroom[];
	mode: "create" | "edit";
	initialValues?: ClassPostFormValues;
	disabled?: boolean;
	role?: "admin" | "teacher" | string;
};

function toDateTimeLocal(date?: string | Date | null) {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "";
	const pad = (num: number) => String(num).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
		d.getMinutes(),
	)}`;
}

function normalizeAttachments(initial?: { label?: string | null; url?: string | null }[]) {
	const values = initial ?? [];
	return Array.from({ length: MAX_ATTACHMENTS }).map((_, index) => values[index] ?? { label: "", url: "" });
}

function ClassPostForm({ classrooms, mode, initialValues, disabled = false, role = "admin" }: ClassPostFormProps) {
	const serverAction = mode === "create" ? createClassPostAction : updateClassPostAction;
	const [formState, formAction, pending] = useActionState<FormState, FormData>(serverAction, initialFormState);
	const formRef = useRef<HTMLFormElement>(null);
	const [editorResetKey, setEditorResetKey] = useState(0);
	const attachments = useMemo(() => normalizeAttachments(initialValues?.attachments), [initialValues?.attachments]);
	const initialContent = initialValues?.contentMarkdown ?? "";

	useEffect(() => {
		if (formState.status === "success" && mode === "create") {
			formRef.current?.reset();
			startTransition(() => {
				setEditorResetKey((key) => key + 1);
			});
		}
	}, [formState.status, mode]);

	const heading = mode === "create" ? "반 소식 작성" : "반 소식 수정";
	const submitLabel = mode === "create" ? "등록" : "변경 사항 저장";
	const helperText =
		mode === "create"
			? disabled
				? "담당 반이 배정되어야 새 소식을 등록할 수 있습니다. 관리자에게 문의해 주세요."
				: "반을 선택하고 최근 활동/공지를 공유해 주세요."
			: "기존 소식 내용을 수정하고 저장하세요.";
	const isTeacher = role === "teacher";
	const audienceDefault = initialValues?.audienceScope ?? "classroom";
	const [audiencePreview, setAudiencePreview] = useState(audienceDefault);
	const audienceLabel =
		audiencePreview === "all"
			? "전체 공개 (퍼블릭)"
			: audiencePreview === "private"
				? "내부 보관 (교직원)"
				: "학부모 전용 (반별)";
	const AudienceIcon = audiencePreview === "all" ? Globe2 : LockKeyhole;

	useEffect(() => {
		setAudiencePreview(audienceDefault);
	}, [audienceDefault]);

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold text-[var(--brand-navy)]">{heading}</h2>
				<p className="text-sm text-muted-foreground">{helperText}</p>
			</div>

			<form
				ref={formRef}
				action={formAction}
				className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
			>
				{mode === "edit" && initialValues?.postId ? <input type="hidden" name="postId" value={initialValues.postId} /> : null}
				<div className="grid gap-6 min-w-0">
					<div className="grid gap-2">
						<Label htmlFor="classroomId">반 선택</Label>
						<select
							id="classroomId"
							name="classroomId"
							required
							defaultValue={initialValues?.classroomId ?? ""}
							className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
						disabled={disabled}
					>
							<option value="">반을 선택하세요</option>
							{classrooms.map((classroom) => (
								<option key={classroom.id} value={classroom.id}>
									{classroom.name}
								</option>
							))}
						</select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="audienceScope">공개 범위</Label>
						<select
							id="audienceScope"
							name="audienceScope"
							defaultValue={audienceDefault}
							className="h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
							disabled={isTeacher}
							onChange={(event) => setAudiencePreview(event.currentTarget.value)}
						>
							<option value="classroom">학부모 전용 (반별)</option>
							<option value="all">전체 공개 (퍼블릭 + 학부모)</option>
							<option value="private">내부 보관 (교직원)</option>
						</select>
						<p className="text-xs text-muted-foreground">
							{isTeacher
								? "교사는 학부모 전용으로만 등록할 수 있으며, 필요 시 관리자가 전체 공개로 변경합니다."
								: "전체 공개를 선택하면 `/stories/class-news`와 학부모 포털 모두에 노출됩니다."}
						</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="title">제목</Label>
						<Input
							id="title"
							name="title"
							defaultValue={initialValues?.title ?? ""}
							placeholder="예) 10월 주간 프로젝트 안내"
							required
							disabled={disabled}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="summary">요약 (선택)</Label>
						<Input
							id="summary"
							name="summary"
							defaultValue={initialValues?.summary ?? ""}
							placeholder="보호자에게 보여줄 한 줄 요약"
							disabled={disabled}
						/>
					</div>

					<div className="grid gap-2 min-w-0">
						<Label htmlFor="contentMarkdown">본문</Label>
						<RichTextEditor
							name="contentMarkdown"
							initialValue={initialContent}
							resetKey={mode === "create" ? editorResetKey : undefined}
							disabled={disabled}
						/>
						<p className="text-xs text-muted-foreground">아이 활동 사진, 일정 안내 등 상세 내용을 입력해 주세요.</p>
					</div>

				</div>

				<div className="grid gap-6 min-w-0">
					<div className="grid gap-2">
						<Label htmlFor="publishAt">게시 예정일 (선택)</Label>
						<input
							id="publishAt"
							name="publishAt"
							type="datetime-local"
							defaultValue={toDateTimeLocal(initialValues?.publishAt ?? null)}
							className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)]"
							disabled={disabled}
						/>
					</div>

					<div className="grid gap-2">
						<span className="text-sm font-medium text-[var(--brand-navy)]">첨부 자료 (최대 {MAX_ATTACHMENTS}개)</span>
						<div className="grid gap-3 min-w-0 md:grid-cols-2">
							{attachments.map((attachment, index) => (
								<div key={index} className="grid gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[rgba(248,247,255,0.6)] p-3">
									<div className="grid gap-1">
										<Label htmlFor={`attachmentLabel-${index}`} className="text-xs">
											첨부 {index + 1} 제목
										</Label>
										<Input
											id={`attachmentLabel-${index}`}
											name="attachmentLabel"
											defaultValue={attachment.label ?? ""}
											placeholder="예) 안내문 PDF"
											disabled={disabled}
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
											disabled={disabled}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="grid gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[rgba(248,247,255,0.45)] p-4 text-xs text-muted-foreground">
						<div className="flex items-center justify-between text-[var(--brand-navy)]">
							<strong className="text-sm font-semibold">프런트 노출 예시</strong>
							<span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">/parents/posts</span>
						</div>
							<div className="rounded-[var(--radius-sm)] border border-[rgba(129,87,236,0.18)] bg-white px-4 py-3 text-[var(--brand-navy)] shadow-[var(--shadow-soft)]">
								<div className="flex items-center justify-between text-[11px] text-muted-foreground">
									<span className="font-medium text-[var(--brand-navy)]">개나리반</span>
									<span className="inline-flex items-center gap-1">
										<CalendarDays className="h-3 w-3" aria-hidden />
										2025.03.12
									</span>
								</div>
								<div className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
									<AudienceIcon className="h-3 w-3" aria-hidden />
									<span>{audienceLabel}</span>
								</div>
								<p className="mt-2 text-sm font-semibold text-[var(--brand-navy)]">봄나들이 준비 안내</p>
								<p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
									요약은 목록과 학부모 알림에 함께 노출됩니다. 핵심 문장을 한 줄로 정리하면 가독성이 좋아집니다.
								</p>
							<div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
								<span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2 py-1">
									<ImageIcon className="h-3 w-3" aria-hidden />
									사진 3
								</span>
								<span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2 py-1">
									<Paperclip className="h-3 w-3" aria-hidden />
									첨부 1
								</span>
							</div>
						</div>
						<ul className="space-y-1 text-[11px] leading-relaxed">
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">제목</strong> → 학부모 목록/모달 헤더에 노출
							</li>
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">요약</strong> → 목록 2줄 요약 + 알림 문구에 사용
							</li>
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">공개 범위</strong> → 전체 공개 시 `/stories/class-news`에도 미리보기 제공
							</li>
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">본문</strong> → 모달 본문과 메일/앱 푸시에 그대로 반영
							</li>
							<li>
								<strong className="font-semibold text-[var(--brand-navy)]">첨부 URL</strong> → 사진은 갤러리, 파일은 첨부 목록으로 구분
							</li>
						</ul>
					</div>
				</div>

				<div className="md:col-span-2 flex flex-col gap-4">
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
						<Button type="submit" disabled={pending || disabled}>
							{pending ? "진행 중..." : submitLabel}
						</Button>
						<span className="text-xs text-muted-foreground">
							{mode === "create" ? "등록 후 학부모 포털이 즉시 갱신됩니다." : "저장 후 학부모 포털이 즉시 갱신됩니다."}
						</span>
					</div>
				</div>
			</form>
		</section>
	);
}

export function CreateClassPostForm(props: Omit<ClassPostFormProps, "mode">) {
	return <ClassPostForm {...props} mode="create" />;
}

export function EditClassPostForm(props: Omit<ClassPostFormProps, "mode">) {
	return <ClassPostForm {...props} mode="edit" />;
}

export type { ClassPostFormValues };

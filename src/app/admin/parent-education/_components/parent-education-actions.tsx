"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import {
	deleteParentEducationPostAction,
	toggleParentEducationPublishAction,
} from "../actions";
import { initialFormState, type FormState } from "../../form-state";

export function TogglePublishButton({ postId, isPublished }: { postId: string; isPublished: boolean }) {
	const [formState, formAction, pending] = useActionState<FormState, FormData>(
		toggleParentEducationPublishAction,
		initialFormState,
	);
	return (
		<form action={formAction} className="flex flex-col gap-1">
			<input type="hidden" name="postId" value={postId} />
			<input type="hidden" name="isPublished" value={(!isPublished).toString()} />
			<Button type="submit" variant="outline" size="sm" disabled={pending}>
				{isPublished ? "초안으로" : "게시 전환"}
			</Button>
			{formState.status === "error" ? (
				<span className="text-xs text-destructive">{formState.message}</span>
			) : null}
		</form>
	);
}

export function DeleteParentEducationButton({ postId }: { postId: string }) {
	const [formState, formAction, pending] = useActionState<FormState, FormData>(
		deleteParentEducationPostAction,
		initialFormState,
	);

	return (
		<form action={formAction} className="flex flex-col gap-1">
			<input type="hidden" name="postId" value={postId} />
			<Button type="submit" variant="destructive" size="sm" disabled={pending}>
				삭제
			</Button>
			{formState.status === "error" ? (
				<span className="text-xs text-destructive">{formState.message}</span>
			) : null}
		</form>
	);
}

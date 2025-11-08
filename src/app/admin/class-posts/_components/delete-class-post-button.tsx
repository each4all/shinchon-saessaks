"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { deleteClassPostAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

export function DeleteClassPostButton({ postId }: { postId: string }) {
	const [, formAction, pending] = useActionState<FormState, FormData>(
		deleteClassPostAction,
		initialFormState,
	);

	return (
		<form
			className="inline-flex"
			action={formAction}
			onSubmit={(event) => {
				if (!confirm("해당 반 소식을 삭제하시겠습니까?")) {
					event.preventDefault();
				}
			}}
		>
			<input type="hidden" name="postId" value={postId} />
			<Button variant="destructive" size="sm" type="submit" disabled={pending}>
				{pending ? "삭제 중..." : "삭제"}
			</Button>
		</form>
	);
}

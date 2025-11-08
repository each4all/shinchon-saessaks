"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { deleteNutritionBulletinAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

export function DeleteNutritionBulletinButton({ bulletinId }: { bulletinId: string }) {
	const [, formAction, pending] = useActionState<FormState, FormData>(deleteNutritionBulletinAction, initialFormState);

	return (
		<form
			className="inline-flex"
			action={formAction}
			onSubmit={(event) => {
				if (!confirm("해당 영양 게시물을 삭제하시겠습니까?")) {
					event.preventDefault();
				}
			}}
		>
			<input type="hidden" name="bulletinId" value={bulletinId} />
			<Button variant="destructive" size="sm" type="submit" disabled={pending}>
				{pending ? "삭제 중..." : "삭제"}
			</Button>
		</form>
	);
}

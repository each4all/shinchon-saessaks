"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { deleteMealPlanAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

export function DeleteMealPlanButton({ planId }: { planId: string }) {
	const [, formAction, pending] = useActionState<FormState, FormData>(deleteMealPlanAction, initialFormState);

	return (
		<form
			className="inline-flex"
			action={formAction}
			onSubmit={(event) => {
				if (!confirm("해당 급식 정보를 삭제하시겠습니까?")) {
					event.preventDefault();
				}
			}}
		>
			<input type="hidden" name="planId" value={planId} />
			<Button variant="destructive" size="sm" type="submit" disabled={pending}>
				{pending ? "삭제 중..." : "삭제"}
			</Button>
		</form>
	);
}

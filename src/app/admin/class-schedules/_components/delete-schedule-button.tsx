"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { deleteScheduleAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

export function DeleteScheduleButton({ scheduleId }: { scheduleId: string }) {
	const [, formAction, pending] = useActionState<FormState, FormData>(
		deleteScheduleAction,
		initialFormState,
	);

	return (
		<form
			className="inline-flex"
			action={formAction}
			onSubmit={(event) => {
				if (!confirm("해당 일정을 삭제하시겠습니까?")) {
					event.preventDefault();
				}
			}}
		>
			<input type="hidden" name="scheduleId" value={scheduleId} />
			<Button variant="destructive" size="sm" type="submit" disabled={pending}>
				{pending ? "삭제 중..." : "삭제"}
			</Button>
		</form>
	);
}

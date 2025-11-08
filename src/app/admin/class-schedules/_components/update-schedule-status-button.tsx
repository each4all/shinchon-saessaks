"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";

import { updateScheduleStatusAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

type UpdateScheduleStatusButtonProps = {
	scheduleId: string;
	status: "draft" | "published" | "cancelled";
	children: React.ReactNode;
	variant?: "default" | "outline" | "destructive" | "ghost";
	size?: "sm" | "default";
	confirmMessage?: string;
	requireReason?: boolean;
	defaultReason?: string | null;
	disabled?: boolean;
};

export function UpdateScheduleStatusButton({
	scheduleId,
	status,
	children,
	variant = "outline",
	size = "sm",
	confirmMessage,
	requireReason = false,
	defaultReason = "",
	disabled = false,
}: UpdateScheduleStatusButtonProps) {
	const [, formAction, pending] = useActionState<FormState, FormData>(updateScheduleStatusAction, initialFormState);
	const reasonRef = useRef<HTMLInputElement>(null);

	return (
		<form
			className="inline-flex"
			action={formAction}
			onSubmit={(event) => {
				if (disabled) {
					event.preventDefault();
					return;
				}

				if (confirmMessage && !confirm(confirmMessage)) {
					event.preventDefault();
					return;
				}

				if (requireReason) {
					const currentReason = reasonRef.current?.value?.trim() ?? defaultReason ?? "";
					const input = prompt("취소 사유를 입력해 주세요.", currentReason);
					if (!input || input.trim().length === 0) {
						alert("취소 사유를 입력해 주세요.");
						event.preventDefault();
						return;
					}
					if (reasonRef.current) {
						reasonRef.current.value = input.trim();
					}
				} else if (reasonRef.current) {
					reasonRef.current.value = "";
				}
			}}
		>
			<input type="hidden" name="scheduleId" value={scheduleId} />
			<input type="hidden" name="status" value={status} />
			<input ref={reasonRef} type="hidden" name="cancellationReason" defaultValue={defaultReason ?? ""} />
			<Button variant={variant} size={size} type="submit" disabled={pending || disabled}>
				{pending ? "진행 중..." : children}
			</Button>
		</form>
	);
}

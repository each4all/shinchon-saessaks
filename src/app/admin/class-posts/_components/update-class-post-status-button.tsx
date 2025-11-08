"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { changeClassPostStatusAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

type StatusButtonProps = {
	postId: string;
	status: "draft" | "published" | "archived";
	children: React.ReactNode;
	variant?: "default" | "outline" | "destructive";
	confirmMessage?: string;
	disabled?: boolean;
	size?: "sm" | "default";
};

export function UpdateClassPostStatusButton({
	postId,
	status,
	children,
	variant = "outline",
	confirmMessage,
	disabled = false,
	size = "sm",
}: StatusButtonProps) {
	const [, formAction, pending] = useActionState<FormState, FormData>(changeClassPostStatusAction, initialFormState);

	return (
		<form
			className="inline-flex"
			action={formAction}
			onSubmit={(event) => {
				if (confirmMessage && !confirm(confirmMessage)) {
					event.preventDefault();
				}
			}}
		>
			<input type="hidden" name="postId" value={postId} />
			<input type="hidden" name="status" value={status} />
			<Button variant={variant} size={size} type="submit" disabled={pending || disabled}>
				{pending ? "진행 중..." : children}
			</Button>
		</form>
	);
}

"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { changeNutritionBulletinStatusAction } from "../actions";
import { initialFormState, type FormState } from "../../form-state";

type UpdateNutritionBulletinStatusButtonProps = {
	bulletinId: string;
	status: "draft" | "published" | "archived";
	children: React.ReactNode;
	variant?: "default" | "outline" | "destructive" | "ghost";
	size?: "sm" | "default";
	confirmMessage?: string;
	disabled?: boolean;
};

export function UpdateNutritionBulletinStatusButton({
	bulletinId,
	status,
	children,
	variant = "outline",
	size = "sm",
	confirmMessage,
	disabled = false,
}: UpdateNutritionBulletinStatusButtonProps) {
	const [, formAction, pending] = useActionState<FormState, FormData>(changeNutritionBulletinStatusAction, initialFormState);

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
				}
			}}
		>
			<input type="hidden" name="bulletinId" value={bulletinId} />
			<input type="hidden" name="status" value={status} />
			<Button variant={variant} size={size} type="submit" disabled={disabled || pending}>
				{pending ? "진행 중..." : children}
			</Button>
		</form>
	);
}

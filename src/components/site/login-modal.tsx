"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { LoginForm } from "@/app/member/login/login-form";
import { Button } from "@/components/ui/button";

type LoginModalProps = {
	open: boolean;
	onClose: () => void;
	redirectTo?: string;
};

export function LoginModal({ open, onClose, redirectTo }: LoginModalProps) {
	useEffect(() => {
		if (!open) return;
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = original;
		};
	}, [open]);

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(17,14,42,0.55)] backdrop-blur-sm px-4 py-10 sm:px-6">
			<div className="relative w-full max-w-lg rounded-[28px] border border-[rgba(255,255,255,0.5)] bg-white/95 p-6 shadow-[0_40px_120px_rgba(28,9,80,0.18)]">
				<div className="absolute top-4 right-4">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-9 w-9 rounded-full text-[var(--brand-navy)] hover:bg-[rgba(129,87,236,0.12)]"
						onClick={onClose}
						aria-label="로그인 창 닫기"
					>
						<X className="h-4 w-4" aria-hidden />
					</Button>
				</div>
				<LoginForm
					layout="card"
					redirectTo={redirectTo}
					onSuccess={onClose}
					badgeLabel="Parents & Staff"
					heading="로그인 후 자세히 확인하세요"
					description="반별 게시글은 승인된 학부모와 교직원에게만 제공됩니다."
					showRegisterLink={false}
				/>
				<p className="mt-4 text-center text-xs text-muted-foreground">
					계정이 없으신가요?{" "}
					<a href="/member/register" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
						회원가입 신청
					</a>
				</p>
			</div>
		</div>
	);
}

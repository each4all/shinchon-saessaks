"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
	layout?: "page" | "card";
	redirectTo?: string;
	onSuccess?: () => void;
	badgeLabel?: string;
	heading?: string;
	description?: string;
	showRegisterLink?: boolean;
};

export function LoginForm({
	layout = "page",
	redirectTo,
	onSuccess,
	badgeLabel = "Member Access",
	heading = "신촌몬테소리 로그인",
	description = "승인된 학부모와 교직원은 포털에서 반 소식과 서류를 확인하실 수 있습니다.",
	showRegisterLink = true,
}: LoginFormProps = {}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const redirectParam = searchParams?.get("redirect");
	const redirectTarget = redirectTo ?? redirectParam ?? "/parents";
	const registered = searchParams?.get("registered") === "1";
	const statusParam = searchParams?.get("status");

	const successMessage = useMemo(
		() =>
			registered
				? "회원가입이 완료되었습니다. 승인 후 로그인하실 수 있습니다."
				: null,
		[registered],
	);

	const derivedErrorMessage = useMemo(
		() => (statusParam === "pending" ? "관리자 승인 후 로그인하실 수 있습니다." : null),
		[statusParam],
	);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		startTransition(async () => {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (!result) {
				setError("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
				return;
			}

			if (result.error) {
				setError("이메일 또는 비밀번호가 올바르지 않습니다.");
				return;
			}

			try {
				const sessionResponse = await fetch("/api/auth/session");
				const sessionData = (await sessionResponse.json()) as {
					user?: { status?: string | null };
				} | null;
				const userStatus = sessionData?.user?.status;

				if (userStatus && userStatus !== "active") {
					router.replace("/parents/pending");
					return;
				}
			} catch (sessionError) {
				console.error("세션 정보를 불러오는 중 오류 발생", sessionError);
			}

			router.replace(redirectTarget);
			onSuccess?.();
		});
	};

	const hero = (
		<div className="flex flex-col gap-3 text-center">
			<Badge variant="outline" className="mx-auto w-fit">
				{badgeLabel}
			</Badge>
			<h1 className="font-heading text-[clamp(2rem,4vw,2.75rem)] leading-tight">{heading}</h1>
			<p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
		</div>
	);

	const cardBody = (
		<Card>
			<form onSubmit={handleSubmit}>
				<CardHeader className="space-y-1 text-left">
					<CardTitle className="text-lg">이메일로 로그인</CardTitle>
					<CardDescription>
						가입 승인 완료 후 전달받은 계정 정보를 입력해 주세요. 문제가 있으면 관리자에게 문의하세요.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
					<div className="space-y-3">
						<div className="grid gap-1.5">
							<Label htmlFor="email">이메일</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="password">비밀번호</Label>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								required
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</div>
					</div>

					<div className="min-h-[1.5rem] text-xs leading-relaxed">
						{successMessage ? <p className="text-success">{successMessage}</p> : null}
						{!successMessage && (error ?? derivedErrorMessage) ? (
							<p className="text-destructive">{error ?? derivedErrorMessage}</p>
						) : null}
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-3">
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? "로그인 중..." : "로그인"}
					</Button>
					{showRegisterLink ? (
						<Button variant="ghost" asChild className="w-full">
							<Link href="/member/register">처음이신가요? 회원가입하기</Link>
						</Button>
					) : null}
				</CardFooter>
			</form>
		</Card>
	);

	if (layout === "page") {
		return (
			<div className="bg-[var(--background)] text-[var(--brand-navy)]">
				<section className="mx-auto flex max-w-sm flex-col gap-8 px-6 py-24 sm:px-10 lg:px-12">
					{hero}
					{cardBody}
				</section>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{hero}
			{cardBody}
		</div>
	);
}

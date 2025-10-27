import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function ParentsPendingPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/member/login?redirect=/parents");
	}

	if (session.user.status === "active") {
		redirect("/parents");
	}

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16 sm:px-10 lg:px-12">
				<Badge variant="outline" className="w-fit">
					승인 대기 중
				</Badge>
				<h1 className="font-heading text-[clamp(2rem,4vw,2.75rem)] leading-tight">
					관리자 확인 후 이용하실 수 있어요
				</h1>
				<p className="text-sm leading-relaxed text-muted-foreground">
					요청하신 계정은 아직 승인 절차가 진행 중입니다. 관리자가 정보를 검토한 뒤 이메일로 안내드릴 예정이며,
					승인 전까지는 학부모 포털 기능이 제한됩니다.
				</p>
			</section>

			<section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-20 sm:px-10 lg:px-12">
				<Card className="border-[var(--border)] bg-white/90">
					<CardHeader className="space-y-2">
						<CardTitle className="text-lg">무엇을 해야 하나요?</CardTitle>
						<CardDescription>
							승인이 완료되면 등록된 이메일로 알림을 보내드립니다. 문의 사항이 있으면 아래 연락처로 연락 주세요.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
						<ul className="list-disc space-y-2 pl-5">
							<li>회원 가입 시 입력한 정보가 정확한지 다시 한 번 확인해 주세요.</li>
							<li>승인까지는 영업일 기준 하루 내외가 소요될 수 있습니다.</li>
							<li>긴급 문의는 원으로 전화(02-324-0671) 또는 이메일 hello@shinchonkid.com 로 연락해 주세요.</li>
						</ul>
						<div className="flex flex-wrap gap-3 pt-2 text-sm">
							<Button variant="outline" asChild>
								<Link href="/news">공지사항 보기</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/">홈으로 가기</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}

import Link from "next/link";

const contactInfo = [
	{ label: "주소", value: "서울특별시 서대문구 신촌로 43" },
	{ label: "전화", value: "02-324-0671" },
	{ label: "이메일", value: "hello@shinchonkid.com" },
];

const quickLinks = [
	{ href: "#programs", label: "교육 프로그램" },
	{ href: "#admissions", label: "입학 절차" },
	{ href: "#news", label: "공지사항" },
	{ href: "#visit", label: "오시는 길" },
];

export function SiteFooter() {
	return (
		<footer className="border-t border-[var(--border)] bg-[var(--background)]">
			<div className="mx-auto grid max-w-6xl gap-6 px-6 py-7 sm:px-10 lg:px-12 md:grid-cols-3 md:items-start">
				<section className="space-y-2">
					<h2 className="font-heading text-lg text-[var(--brand-navy)]">신촌몬테소리유치원</h2>
					<p className="text-sm leading-relaxed text-muted-foreground">
						아이 한 명, 한 명의 리듬을 발견하고 키우는 신촌몬테소리유치원은 따뜻한 공동체와 안전한 배움 환경을 통해 모든 가족이 연결되는 경험을 만들어 갑니다.
					</p>
				</section>

				<section className="space-y-3 text-sm text-muted-foreground">
					<h3 className="font-semibold text-[var(--brand-navy)]">빠른 연결</h3>
					<ul className="space-y-2">
						{quickLinks.map((link) => (
							<li key={link.href}>
								<Link href={link.href} className="transition hover:text-[var(--brand-primary)]">
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</section>

				<section className="space-y-3 text-sm text-muted-foreground">
					<h3 className="font-semibold text-[var(--brand-navy)]">연락처</h3>
					<ul className="space-y-2">
						{contactInfo.map((item) => (
							<li key={item.label} className="flex flex-wrap items-center gap-2">
								<span className="min-w-[42px] font-medium text-[var(--brand-navy)]">{item.label}</span>
								<span className="text-[var(--brand-navy)]">{item.value}</span>
							</li>
						))}
					</ul>
				</section>
			</div>

			<div className="border-t border-[var(--border)] bg-white/80">
				<div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
					<span>© {new Date().getFullYear()} Shinchon Montessori. All rights reserved.</span>
					<div className="flex gap-4">
						<Link href="/privacy" className="hover:text-[var(--brand-primary)]">
							개인정보처리방침
						</Link>
						<Link href="/terms" className="hover:text-[var(--brand-primary)]">
							이용약관
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

import type { Metadata } from "next";
import { Architects_Daughter, Kanit } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SessionProvider } from "@/components/providers/session-provider";

const kanit = Kanit({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-body",
	display: "swap",
});

const architectsDaughter = Architects_Daughter({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-accent",
	display: "swap",
});

export const metadata: Metadata = {
	title: "신촌몬테소리유치원",
	description:
		"아이의 하루가 반짝이는 신촌몬테소리유치원의 교육 프로그램, 입학 안내, 학부모 소통 공간을 소개합니다.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	return (
		<html lang="ko">
			<body className={`${kanit.variable} ${architectsDaughter.variable} antialiased`}>
				<SessionProvider session={session}>
					<div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--brand-navy)]">
						<SiteHeader initialSession={session} />
						<main className="flex-1">{children}</main>
						<SiteFooter />
					</div>
				</SessionProvider>
			</body>
		</html>
	);
}

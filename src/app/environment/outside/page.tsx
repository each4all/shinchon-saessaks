import Link from "next/link";

import { EnvironmentGallery } from "@/components/environment/EnvironmentGallery";
import { outdoorGallery } from "@/data/environment";

export default function OutdoorEnvironmentPage() {
	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육환경</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">실외 교육환경</h1>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>교육환경</span>
						<span>/</span>
						<span>실외</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-12">
				<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
					<p className="text-sm leading-relaxed text-muted-foreground">
						창조의 뜰, 숲속놀이터, 기쁨의 텃밭 등 자연과 만나는 공간을 확대해 생태 감수성과 신체 활동을 길러 줍니다. 아래 갤러리에서 아이들이
						마주하는 실외 공간을 확인하세요.
					</p>
				</div>

				<EnvironmentGallery images={outdoorGallery} />
			</section>
		</div>
	);
}

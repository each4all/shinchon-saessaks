import Link from "next/link";

import { EnvironmentGallery } from "@/components/environment/EnvironmentGallery";
import { indoorGallery } from "@/data/environment";

export default function InteriorEnvironmentPage() {
	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">교육환경</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">실내 교육환경</h1>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>교육환경</span>
						<span>/</span>
						<span>실내</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-12">
				<div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
					<p className="text-sm leading-relaxed text-muted-foreground">
						아이들이 하루 대부분을 보내는 교실은 혼합 연령 몬테소리 철학에 맞춰 세심하게 준비되어 있습니다. 민들레·백합·개나리·장미반
						교실을 둘러보며 아이가 생활할 공간을 확인해 보세요.
					</p>
				</div>

				<EnvironmentGallery images={indoorGallery} />
			</section>
		</div>
	);
}

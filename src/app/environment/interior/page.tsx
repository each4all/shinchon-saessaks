import Link from "next/link";

import { EnvironmentSlider } from "@/components/environment/EnvironmentSlider";
import { EnvironmentSidebar } from "@/components/environment/EnvironmentSidebar";
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
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<EnvironmentSidebar stickyOffset={112} />

					<article className="space-y-6">
						<EnvironmentSlider images={indoorGallery} />
					</article>
				</div>
			</section>
		</div>
	);
}

import Link from "next/link";

import { IntroSidebar } from "@/components/intro/IntroSidebar";
import { locationInfo } from "@/data/location";

export default function LocationPage() {
	const { title, address, phone, mapEmbedSrc, googleMapsUrl, naverMapsUrl } = locationInfo;

	return (
		<div className="bg-[var(--background)] text-[var(--brand-navy)]">
			<section className="border-b border-[var(--border)] bg-white/85">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-12 sm:px-10 lg:px-12">
					<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">유치원 소개</p>
					<h1 className="font-heading text-[clamp(2.4rem,4vw,3.2rem)] leading-tight">찾아오시는 길</h1>
					<nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="breadcrumb">
						<Link href="/" className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
							홈
						</Link>
						<span>/</span>
						<span>유치원 소개</span>
						<span>/</span>
						<span>{title}</span>
					</nav>
				</div>
			</section>

			<section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
				<div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
					<IntroSidebar />

					<article className="space-y-6">
						<section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-6 shadow-[var(--shadow-soft)]">
							<h2 className="text-[clamp(1.6rem,2.4vw,2.1rem)] font-semibold text-[var(--brand-primary)]">{title}</h2>
							<dl className="mt-4 space-y-3 text-sm text-muted-foreground">
								<div>
									<dt className="font-semibold text-[var(--brand-navy)]">주소</dt>
									<dd>{address}</dd>
								</div>
								<div>
									<dt className="font-semibold text-[var(--brand-navy)]">전화</dt>
									<dd>
										<Link href={`tel:${phone}`} className="text-[var(--brand-primary)] underline-offset-4 hover:underline">
											{phone}
										</Link>
									</dd>
								</div>
							</dl>

							<div className="mt-4 flex flex-wrap gap-3 text-sm">
								<Link
									href={googleMapsUrl}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--brand-primary)] px-4 py-2 font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)] hover:text-white"
								>
									Google 지도
								</Link>
								<Link
									href={naverMapsUrl}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--brand-secondary)] px-4 py-2 font-semibold text-[var(--brand-secondary)] transition hover:bg-[var(--brand-secondary)] hover:text-white"
								>
									네이버 지도
								</Link>
							</div>
						</section>

						<section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/90 shadow-[var(--shadow-soft)]">
							<iframe
								title="신촌몬테소리유치원 위치"
								src={mapEmbedSrc}
								className="h-[420px] w-full"
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								allowFullScreen
							/>
						</section>
					</article>
				</div>
			</section>
		</div>
	);
}

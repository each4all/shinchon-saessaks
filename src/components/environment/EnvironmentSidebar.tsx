import Link from "next/link";

const environmentNav = [
	{ label: "실내", href: "/environment/interior", description: "민들레·백합·개나리·장미반" },
	{ label: "실외", href: "/environment/outside", description: "창조의 뜰·숲속놀이터" },
];

export function EnvironmentSidebar() {
	return (
		<aside className="self-start rounded-[var(--radius-lg)] border border-[var(--brand-primary)]/20 bg-[var(--brand-mint)]/20 p-4 shadow-[var(--shadow-soft)]">
			<p className="text-sm font-semibold text-[var(--brand-navy)]">교육환경</p>
			<ul className="mt-4 space-y-2 text-sm text-[var(--brand-navy)]">
				{environmentNav.map((item) => (
					<li key={item.label}>
						<Link
							href={item.href}
							className="flex flex-col rounded-[var(--radius-md)] px-3 py-2 transition hover:bg-white/80 hover:text-[var(--brand-primary)]"
						>
							<span className="font-semibold">{item.label}</span>
						</Link>
					</li>
				))}
			</ul>
		</aside>
	);
}

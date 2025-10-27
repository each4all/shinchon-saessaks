import type { Session } from "next-auth";

import { auth } from "@/lib/auth";

import { SiteHeaderClient } from "./site-header.client";

type SiteHeaderProps = {
	initialSession?: Session | null;
};

export async function SiteHeader({ initialSession = null }: SiteHeaderProps = {}) {
	const session = initialSession ?? (await auth());
	return <SiteHeaderClient initialSession={session} />;
}

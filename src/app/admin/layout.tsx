import type { ReactNode } from "react";

import { auth } from "@/lib/auth";

import { AdminShell } from "./_components/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
	const session = await auth();

	return <AdminShell session={session}>{children}</AdminShell>;
}

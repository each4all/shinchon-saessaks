import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	const { pathname, searchParams, origin } = request.nextUrl;
	const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
	const secureCookie = request.nextUrl.protocol === "https:";
	const cookieName = secureCookie ? "__Secure-authjs.session-token" : "authjs.session-token";
	const salt = process.env.AUTH_SALT ?? process.env.NEXTAUTH_SALT ?? cookieName;

	const redirectToLogin = (params: Record<string, string> = {}) => {
		const url = new URL("/member/login", origin);
		const redirect = searchParams.get("redirect") ?? pathname;
		url.searchParams.set("redirect", redirect);
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}
		return NextResponse.redirect(url);
	};

	if (!secret) {
		console.error("AUTH_SECRET (or NEXTAUTH_SECRET) is not configured. Middleware will force login.");
		return redirectToLogin({ reason: "missing-secret" });
	}

	let token = null;
	try {
		token = await getToken({
			req: request,
			secret,
			secureCookie,
			cookieName,
			salt,
		});
	} catch (error) {
		console.error("Failed to read auth token in middleware", error);
		return redirectToLogin({ reason: "token-error" });
	}

	if (pathname.startsWith("/admin")) {
		const adminRouteRules: { prefix: string; roles: Array<string> }[] = [
			{ prefix: "/admin/class-posts", roles: ["admin", "teacher"] },
			{ prefix: "/admin/class-schedules", roles: ["admin", "teacher"] },
			{ prefix: "/admin/meals", roles: ["admin", "nutrition"] },
			{ prefix: "/admin/nutrition", roles: ["admin", "nutrition"] },
		];

		if (!token) {
			return redirectToLogin();
		}

		const role = typeof token.role === "string" ? token.role : "";

		const matchedRule = adminRouteRules.find((rule) => pathname.startsWith(rule.prefix));
		const isAllowed = matchedRule ? matchedRule.roles.includes(role) || role === "admin" : role === "admin";

		if (!isAllowed) {
			if (role === "teacher") {
				return NextResponse.redirect(new URL("/admin/class-posts", origin));
			}
			if (role === "nutrition") {
				return NextResponse.redirect(new URL("/admin/meals", origin));
			}
			return NextResponse.redirect(new URL("/", origin));
		}

		if (pathname === "/admin" && role === "teacher") {
			return NextResponse.redirect(new URL("/admin/class-posts", origin));
		}
		if (pathname === "/admin" && role === "nutrition") {
			return NextResponse.redirect(new URL("/admin/meals", origin));
		}
	}

	if (pathname.startsWith("/parents")) {
		const isPendingLanding = pathname === "/parents/pending";
		if (!token) {
			return redirectToLogin();
		}
		if (token.status !== "active") {
			if (isPendingLanding) {
				return NextResponse.next();
			}
			const pendingUrl = new URL("/parents/pending", origin);
			return NextResponse.redirect(pendingUrl);
		}
		if (isPendingLanding) {
			return NextResponse.redirect(new URL("/parents", origin));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/parents/:path*", "/admin/:path*"],
};

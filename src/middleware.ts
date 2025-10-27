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
		if (!token) {
			return redirectToLogin();
		}
		if (token.role !== "admin") {
			return NextResponse.redirect(new URL("/", origin));
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

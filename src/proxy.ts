import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function pathnameWithoutLocale(pathname: string) {
  const stripped = pathname.replace(
    new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`),
    "",
  );
  return stripped.length > 0 ? stripped : "/";
}

function localeFromPathname(pathname: string) {
  const segment = pathname.split("/")[1];
  return routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : routing.defaultLocale;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const locale = localeFromPathname(pathname);
  const path = pathnameWithoutLocale(pathname);
  const isLogin = path === "/login" || path.startsWith("/login/");
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isLogin) {
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLogin) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const destination =
      callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : `/${locale}`;
    return NextResponse.redirect(new URL(destination, req.nextUrl.origin));
  }

  return intlMiddleware(req);
});

export const config = {
  // Match all pathnames except for
  // - /api, /trpc, /_next, /_vercel
  // - paths containing a dot (e.g. favicon.ico)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

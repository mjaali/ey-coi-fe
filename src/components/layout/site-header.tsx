import modonLogo from "@/assets/ModonLogo.svg";
import { auth } from "@/auth";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { StatusBadge } from "@/components/layout/status-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { surfaceClasses } from "@/theme";
import { getTranslations } from "next-intl/server";

type SiteHeaderProps = {
  brand: string;
  linkHome?: boolean;
  showAuth?: boolean;
  missionId?: string;
  statusLabel?: string;
  showNav?: boolean;
  activeHref?: string;
};

export async function SiteHeader({
  brand,
  linkHome = false,
  showAuth = true,
  missionId = "COI-OPS-01",
  statusLabel,
  showNav = true,
  activeHref,
}: SiteHeaderProps) {
  const session = showAuth ? await auth() : null;
  const t = await getTranslations("IntroPage");
  const utc = new Date().toISOString().slice(11, 19);

  const nav = showNav
    ? [
        { href: "/", label: t("nav.home") },
        { href: "/gap-analysis", label: t("nav.gap") },
        { href: "/industry-analysis", label: t("nav.industry") },
        { href: "/map", label: t("nav.cities") },
        { href: "/demand-analysis", label: t("nav.demand") },
      ]
    : [];

  const brandMark = (
    <img
      src={modonLogo.src}
      alt={brand}
      width={132}
      height={58}
      className="h-5 w-auto"
    />
  );

  return (
    <header
      className={cn(
        surfaceClasses.glass,
        "sticky top-0 z-30 -mx-3 flex flex-col gap-2 px-3 py-2 sm:-mx-5 sm:px-4"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {linkHome ? (
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              {brandMark}
            </Link>
          ) : (
            <div className="flex shrink-0 items-center gap-2.5">{brandMark}</div>
          )}
          <div className="hidden min-w-0 sm:block">
            <div className="hud-label truncate">{missionId}</div>
            <div className="mt-0.5 font-mono text-[0.65rem] tabular-nums text-muted-foreground">
              UTC {utc}
            </div>
          </div>
          {statusLabel ? (
            <StatusBadge
              label={statusLabel}
              tone="nominal"
              className="hidden md:inline-flex"
            />
          ) : (
            <StatusBadge
              label={t("status.live")}
              tone="nominal"
              className="hidden md:inline-flex"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <SignOutButton
              name={session.user.name}
              email={session.user.email}
            />
          ) : null}
          <ThemeToggle />
          <LocaleSwitcher />
        </div>
      </div>

      {nav.length > 0 ? (
        <nav className="flex gap-1 overflow-x-auto pb-0.5">
          {nav.map((item) => {
            const active =
              activeHref === item.href ||
              (!activeHref && item.href === "/" && !linkHome);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}

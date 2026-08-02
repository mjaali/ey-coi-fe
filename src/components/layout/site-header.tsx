import modonLogo from "@/assets/ModonLogo.svg";
import { auth } from "@/auth";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Link } from "@/i18n/navigation";

type SiteHeaderProps = {
  brand: string;
  linkHome?: boolean;
  showAuth?: boolean;
};

export async function SiteHeader({
  brand,
  linkHome = false,
  showAuth = true,
}: SiteHeaderProps) {
  const session = showAuth ? await auth() : null;

  const brandMark = (
    <img
      src={modonLogo.src}
      alt={brand}
      width={132}
      height={58}
      className="h-6 w-auto"
    />
  );

  return (
    <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between bg-[color-mix(in_oklab,var(--app-bg-solid)_88%,transparent)] px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
      {linkHome ? (
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          {brandMark}
        </Link>
      ) : (
        <div className="flex items-center gap-2.5">{brandMark}</div>
      )}
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
    </header>
  );
}

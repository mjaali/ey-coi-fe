import modonLogo from "@/assets/ModonLogo.svg";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Link } from "@/i18n/navigation";

type SiteHeaderProps = {
  brand: string;
  linkHome?: boolean;
};

export function SiteHeader({ brand, linkHome = false }: SiteHeaderProps) {
  const brandMark = (
    <img
      src={modonLogo.src}
      alt={brand}
      width={132}
      height={58}
      className="h-8 w-auto"
    />
  );

  return (
    <header className="sticky top-0 z-30 -mx-6 flex items-center justify-between bg-[color-mix(in_oklab,var(--app-bg-solid)_88%,transparent)] px-6 py-3 backdrop-blur-md sm:-mx-10 sm:px-10">
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
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
    </header>
  );
}

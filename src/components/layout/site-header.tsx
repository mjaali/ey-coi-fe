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
    <header className="flex items-center justify-between">
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

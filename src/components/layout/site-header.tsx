import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Link } from "@/i18n/navigation";

type SiteHeaderProps = {
  brand: string;
  linkHome?: boolean;
};

export function SiteHeader({ brand, linkHome = false }: SiteHeaderProps) {
  const brandMark = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
        M
      </span>
      <span className="text-lg font-semibold tracking-tight">{brand}</span>
    </>
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

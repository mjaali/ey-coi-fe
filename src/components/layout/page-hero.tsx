import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  backLabel: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  className?: string;
};

export function PageHero({
  backLabel,
  title,
  subtitle,
  eyebrow,
  titleClassName,
  subtitleClassName,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <Link
        href="/"
        className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />
        {backLabel}
      </Link>
      {eyebrow ? <span className="hud-label text-primary">{eyebrow}</span> : null}
      <h1
        className={cn(
          "max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-4xl",
          titleClassName
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base",
          subtitleClassName
        )}
      >
        {subtitle}
      </p>
    </section>
  );
}

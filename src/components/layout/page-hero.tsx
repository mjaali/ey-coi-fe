import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  backLabel: string;
  title: string;
  subtitle: string;
  titleClassName?: string;
  subtitleClassName?: string;
  className?: string;
};

export function PageHero({
  backLabel,
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 rtl:-scale-x-100" aria-hidden />
        {backLabel}
      </Link>
      <h1
        className={cn(
          "max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl",
          titleClassName
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "max-w-2xl text-lg leading-relaxed text-muted-foreground",
          subtitleClassName
        )}
      >
        {subtitle}
      </p>
    </section>
  );
}

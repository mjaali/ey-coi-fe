import { cn } from "@/lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  gap?: "md" | "lg";
};

export function PageShell({ children, className, gap = "md" }: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12 sm:px-10 sm:py-16",
        gap === "lg" ? "gap-16" : "gap-12",
        className
      )}
    >
      {children}
    </div>
  );
}

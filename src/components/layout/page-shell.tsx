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
        "relative flex w-full flex-1 flex-col px-3 py-4 sm:px-5 sm:py-6",
        gap === "lg" ? "gap-8" : "gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}

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
        "flex w-full flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8",
        gap === "lg" ? "gap-10" : "gap-8",
        className
      )}
    >
      {children}
    </div>
  );
}

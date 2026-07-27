import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  className?: string;
};

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-3.5", className)}>
      <div className="text-xl font-semibold tracking-tight sm:text-2xl">
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

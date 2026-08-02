"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneClasses } from "@/theme";

/** Changes below this are noise, so they render as flat rather than directional. */
const FLAT_THRESHOLD = 0.005;

export function DeltaChip({
  value,
  label,
  className,
  size = "sm",
}: {
  /** Fractional change, e.g. 0.12 for +12%. Null renders nothing. */
  value: number | null;
  label: string;
  className?: string;
  size?: "sm" | "xs";
}) {
  if (value === null || !Number.isFinite(value)) return null;

  const flat = Math.abs(value) < FLAT_THRESHOLD;
  const up = value > 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-1.5 py-0.5 text-[11px]",
        flat
          ? toneClasses.neutral
          : up
            ? toneClasses.positive
            : toneClasses.negative,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

export function Progress({ value, indicatorColor, className, ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/50",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 transition-all duration-700 ease-out rounded-full",
          indicatorColor ||
            (clampedValue >= 85
              ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              : clampedValue >= 70
              ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              : clampedValue >= 50
              ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]")
        )}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "linear" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#141516] text-[#d0d6e0] border-[#23252a]",
    secondary: "bg-[#18191a] text-[#8a8f98] border-[#23252a]",
    success: "bg-[#27a644]/15 text-[#34d399] border-[#27a644]/30",
    warning: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
    destructive: "bg-[#eb5757]/15 text-[#f87171] border-[#eb5757]/30",
    linear: "bg-[#5e6ad2]/15 text-[#828fff] border-[#5e6ad2]/35",
    outline: "border border-[#23252a] text-[#8a8f98] bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

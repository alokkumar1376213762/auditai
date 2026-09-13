import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] disabled:opacity-40 disabled:pointer-events-none rounded-[8px] active:scale-[0.99] select-none";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-3.5 py-1.5 text-sm gap-2",
      lg: "h-11 px-5 text-sm gap-2.5 font-medium",
      icon: "h-9 w-9 p-0",
    };

    const variantStyles = {
      primary:
        "bg-[#5e6ad2] hover:bg-[#828fff] text-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] border border-[#7a85e8]/30",
      secondary:
        "bg-[#0f1011] hover:bg-[#18191a] text-[#f7f8f8] border border-[#23252a] hover:border-[#34343a] shadow-sm",
      outline:
        "border border-[#23252a] hover:border-[#34343a] bg-transparent hover:bg-[#0f1011] text-[#d0d6e0] hover:text-white",
      ghost:
        "hover:bg-[#141516] text-[#8a8f98] hover:text-[#f7f8f8] bg-transparent",
      destructive:
        "bg-[#eb5757]/15 hover:bg-[#eb5757]/25 text-[#eb5757] border border-[#eb5757]/30",
      glow:
        "bg-[#5e6ad2] hover:bg-[#828fff] text-white border border-[#7a85e8]/40 shadow-[0_0_20px_-4px_rgba(94,106,210,0.5)]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "glow" | "amber";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    const variantStyles = {
      primary: "bg-zinc-100 hover:bg-white text-zinc-950 font-medium shadow-sm border border-zinc-200 active:bg-zinc-200",
      secondary: "bg-zinc-800/90 hover:bg-zinc-750 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80",
      destructive: "bg-zinc-900 hover:bg-red-950/80 text-red-400 border border-red-900/50 hover:border-red-800",
      amber: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium border border-zinc-600 hover:border-zinc-500",
      outline: "bg-transparent hover:bg-zinc-800/80 text-zinc-300 border border-zinc-800 hover:border-zinc-700",
      ghost: "bg-transparent hover:bg-zinc-800/70 text-zinc-400 hover:text-zinc-100",
      glow: "bg-zinc-100 hover:bg-white text-zinc-950 font-medium shadow-sm border border-zinc-200",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

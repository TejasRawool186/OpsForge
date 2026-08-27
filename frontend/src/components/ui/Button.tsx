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
      primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-glow border border-cyan-400/30",
      secondary: "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700",
      destructive: "bg-rose-600/90 hover:bg-rose-500 text-white shadow-glow-rose border border-rose-500/40",
      amber: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-glow-amber border border-amber-400/30",
      outline: "bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-700/80 hover:border-slate-600",
      ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white",
      glow: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow font-semibold border border-cyan-400/40",
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

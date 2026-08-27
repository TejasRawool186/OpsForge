"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700/80 rounded-md shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in-0 zoom-in-95",
            positionStyles[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

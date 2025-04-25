import * as React from "react";
import cn from "classnames";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "destructive-outline";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background p-2",
          {
            "bg-accent text-black hover:bg-accent/90": variant === "default",
            "border border-accent bg-background hover:bg-accent/10 hover:text-accent-foreground text-accent":
              variant === "outline",
            "hover:bg-accent/10 hover:text-accent": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
            "border border-red-500 bg-background hover:bg-red-500/10 hover:text-red-500 text-red-500":
              variant === "destructive-outline",
          },
          className
        )}
        disabled={isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };

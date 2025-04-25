import * as React from "react";
import cn from "classnames";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-gray-001 bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/5 focus:bg-transparent",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

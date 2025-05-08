import * as React from "react";
import cn from "classnames";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex resize-none h-32 w-full rounded-xl border border-gray-001 bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/5 focus:bg-transparent",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

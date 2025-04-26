import React, { useState, useEffect } from "react";
import { Input } from "./input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "./button";
import { RiEyeOffFill } from "react-icons/ri";
import { cn } from "~/lib/utils";
export interface SecretInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  hideValue?: boolean;
  key: string;
  value?: string;
  onHideValue?: () => void;
  isChanged?: boolean;
}

export const SecretInput = React.forwardRef<HTMLInputElement, SecretInputProps>(
  (
    {
      className,
      type,
      hideValue,
      value,
      onHideValue,
      id,
      key,
      isChanged,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const [secretValue, setSecretValue] = useState(value);

    useEffect(() => {
      setSecretValue(value);
    }, [value]);

    return (
      <>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild className="relative">
              {hideValue || !value ? (
                <div
                  className="w-full h-10 rounded-xl border border-gray-001 bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/5 focus:bg-transparent cursor-pointer flex items-center"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={props.onClick}
                >
                  <p className="text-gray-500">
                    {isHovered ? (
                      "Click to reveal"
                    ) : (
                      <span className="text-2xl">•••••••</span>
                    )}
                  </p>
                </div>
              ) : (
                <>
                  <Input
                    {...props}
                    value={secretValue}
                    autoFocus={true}
                    onChange={(e) => {
                      setSecretValue(e.target.value);
                      props.onChange?.(e);
                    }}
                    className={cn(
                      isChanged && "border-yellow-500 focus:border-yellow-500",
                      className
                    )}
                  />
                  <button
                    className="absolute right-[6rem] text-gray-500"
                    onClick={onHideValue}
                  >
                    <RiEyeOffFill />
                  </button>
                </>
              )}
            </TooltipTrigger>
            {value && (
              <TooltipContent side="top" align="start">
                <Button variant="outline">Copy</Button>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </>
    );
  }
);

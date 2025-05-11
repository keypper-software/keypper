import React, { useState, useEffect } from "react";
import { Input } from "./input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./button";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { CgUndo } from "react-icons/cg";

export interface SecretInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  hideValue?: boolean;
  key: string;
  value?: string;
  onHideValue?: () => void;
  undoDelete?: () => void;
  isChanged?: boolean;
  isMarkedAsDeleted?: boolean;
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
      undoDelete,
      isChanged,
      isMarkedAsDeleted,
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
              <div className="relative w-full">
                {hideValue || !value || isMarkedAsDeleted ? (
                  <div
                    className={cn(
                      "w-full h-10 rounded-xl border border-gray-001 bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent/5 focus:bg-transparent cursor-pointer flex items-center",
                      isMarkedAsDeleted
                        ? "border-red-500 focus:border-red-500 cursor-not-allowed"
                        : isChanged &&
                            "border-yellow-500 focus:border-yellow-500"
                    )}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={props.onClick}
                  >
                    <p className="text-gray-500">
                      {isHovered && !isMarkedAsDeleted ? (
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
                      disabled={isMarkedAsDeleted}
                      onChange={(e) => {
                        setSecretValue(e.target.value);
                        props.onChange?.(e);
                      }}
                      // disabled={showUndoButton}
                      className={cn(
                        className,
                        isMarkedAsDeleted
                          ? "border-red-500 focus:border-red-500 disabled:!opacity-100"
                          : isChanged &&
                              "border-yellow-500 focus:border-yellow-500"
                      )}
                    />
                  </>
                )}
                {/* TODO []:OPTIMISE STYLINH */}
                <div className="flex absolute z-[1] top-3 cursor-pointer right-4 text-gray-500 items-center gap-x-3">
                  {isMarkedAsDeleted ? (
                    <button onClick={undoDelete}>
                      <CgUndo size={20} />
                    </button>
                  ) : (
                    <div className="">
                      {!hideValue && (
                        <button onClick={onHideValue}>
                          <RiEyeOffFill />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            {value && !isMarkedAsDeleted && (
              <TooltipContent className="bg-transparent" side="top" align="start">
                <Button variant="outline">Copy</Button>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </>
    );
  }
);

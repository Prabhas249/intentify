"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

interface PrimaryButtonProps extends ButtonProps {
  variant?: "default" | "outline" | "secondary";
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    if (variant === "default") {
      return (
        <Button
          ref={ref}
          className={cn(
            "rounded-full px-6 font-medium",
            "bg-linear-to-b from-sky-500 to-sky-600",
            "shadow-[0px_1px_2px_0px_#00000016,0px_2px_4px_0px_#00000006,inset_0px_0px_1.5px_#0084D1,inset_0px_2.5px_0px_#ffffff16,inset_0px_0px_2.5px_#ffffff08]",
            "ring-2 ring-sky-600 hover:from-sky-600 hover:to-sky-700 text-white",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      );
    }

    if (variant === "outline") {
      return (
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "rounded-full px-6 font-medium border-border/50 hover:border-sky-500/30 hover:bg-sky-500/5",
            className
          )}
          {...props}
        >
          {children}
        </Button>
      );
    }

    return (
      <Button
        ref={ref}
        variant="secondary"
        className={cn("rounded-full px-6 font-medium", className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

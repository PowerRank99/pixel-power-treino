
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  indicatorColor?: string;
  pulsateIndicator?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, indicatorColor, pulsateIndicator, ...props }, ref) => {
  const indicatorStyles: React.CSSProperties = {
    transform: `translateX(-${100 - (value || 0)}%)`,
  };
  
  if (indicatorColor) {
    indicatorStyles.backgroundColor = indicatorColor;
  }
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          pulsateIndicator && "animate-pulse",
          indicatorClassName
        )}
        style={indicatorStyles}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

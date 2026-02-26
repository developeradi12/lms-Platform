import { cn } from "@/lib/utils"
import React from "react"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "full"
}

function Skeleton({
  className,
  rounded = "md",
  ...props
}: SkeletonProps) {
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-800 transition-colors",
        roundedClasses[rounded],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
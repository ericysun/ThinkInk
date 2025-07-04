import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressBarVariants = cva("relative h-4 w-full overflow-hidden rounded-full bg-green-100", {
  variants: {
    variant: {
      default: "bg-green-100",
      success: "bg-emerald-100",
      info: "bg-blue-100",
      warning: "bg-yellow-100",
      danger: "bg-red-100",
    },
    size: {
      default: "h-4",
      sm: "h-2",
      lg: "h-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

const progressVariants = cva("h-full transition-all ease-in-out duration-500", {
  variants: {
    variant: {
      default: "bg-green-600",
      success: "bg-emerald-600",
      info: "bg-blue-600",
      warning: "bg-yellow-600",
      danger: "bg-red-600",
    },
    animated: {
      true: "relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    animated: true,
  },
})

interface ProgressBarProps extends VariantProps<typeof progressBarVariants> {
  value: number
  max?: number
  showValue?: boolean
  animated?: boolean
  className?: string
  progressClassName?: string
}

export function ProgressBar({
  value,
  max = 100,
  showValue = false,
  animated = true,
  variant,
  size,
  className,
  progressClassName,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn(progressBarVariants({ variant, size }), className)}>
      <div
        className={cn(progressVariants({ variant, animated }), progressClassName)}
        style={{ width: `${percentage}%` }}
      />
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

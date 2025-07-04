import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle, Medal, Star, Trophy, Award } from "lucide-react"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full p-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        bronze: "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200",
        silver: "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200",
        gold: "bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200",
        platinum: "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200",
      },
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "bronze",
      size: "md",
    },
  },
)

const iconMap = {
  checkmark: CheckCircle,
  medal: Medal,
  star: Star,
  trophy: Trophy,
  award: Award,
}

interface AchievementBadgeProps extends VariantProps<typeof badgeVariants> {
  icon: keyof typeof iconMap
  className?: string
  tooltip?: string
}

export function AchievementBadge({ variant, size, icon, className, tooltip }: AchievementBadgeProps) {
  const Icon = iconMap[icon]

  return (
    <div className="relative group">
      <div className={cn(badgeVariants({ variant, size }), className)}>
        <Icon className="h-full w-full p-1" />
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  )
}

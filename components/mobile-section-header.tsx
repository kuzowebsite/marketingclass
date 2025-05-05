"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MobileSectionHeaderProps {
  title: string
  description?: string
  badge?: string
  badgeColor?: "primary" | "secondary" | "teal" | "blue" | "purple" | "amber"
  className?: string
  align?: "left" | "center"
}

export function MobileSectionHeader({
  title,
  description,
  badge,
  badgeColor = "primary",
  className,
  align = "left",
}: MobileSectionHeaderProps) {
  const getBadgeClass = () => {
    switch (badgeColor) {
      case "teal":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
      case "blue":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "purple":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "amber":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "secondary":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <div className={cn("mb-6", align === "center" ? "text-center" : "", className)}>
      {badge && <Badge className={cn("mb-2 rounded-full px-3 py-1", getBadgeClass())}>{badge}</Badge>}
      <h2 className="text-xl font-bold tracking-tight mb-1">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

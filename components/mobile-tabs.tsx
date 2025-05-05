"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { BookOpen, TrendingUp, Sparkles, Star } from "lucide-react"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface MobileTabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

export function MobileTabs({ tabs, defaultTab, onChange, className }: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (onChange) {
      onChange(tabId)
    }
  }

  return (
    <div className={cn("relative overflow-x-auto scrollbar-hide", className)}>
      <div className="flex min-w-max p-1 bg-gray-800/50 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "relative flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md min-w-[80px] transition-all duration-200",
              activeTab === tab.id ? "text-gray-900" : "text-gray-400",
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-400 rounded-md"
                initial={false}
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative flex items-center gap-1.5 z-10">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function CourseTabsPreset({ onChange }: { onChange?: (tabId: string) => void }) {
  const tabs = [
    { id: "all", label: "Бүгд", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: "popular", label: "Эрэлттэй", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: "new", label: "Шинэ", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "featured", label: "Онцлох", icon: <Star className="h-3.5 w-3.5" /> },
  ]

  return <MobileTabs tabs={tabs} defaultTab="all" onChange={onChange} />
}

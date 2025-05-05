"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Filter, SlidersHorizontal, Check, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface FilterOption {
  id: string
  name: string
}

interface MobileFilterBarProps {
  title?: string
  categories?: FilterOption[]
  levels?: FilterOption[]
  types?: FilterOption[]
  onFilterChange: (type: string, value: string | null) => void
  selectedCategory: string | null
  selectedLevel: string | null
  selectedType: string | null
  totalItems: number
}

export function MobileFilterBar({
  title = "Шүүлтүүр",
  categories = [],
  levels = [],
  types = [],
  onFilterChange,
  selectedCategory,
  selectedLevel,
  selectedType,
  totalItems,
}: MobileFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const hasActiveFilters = selectedCategory || selectedLevel || selectedType
  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedLevel ? 1 : 0) + (selectedType ? 1 : 0)

  const handleReset = () => {
    onFilterChange("category", null)
    onFilterChange("level", null)
    onFilterChange("type", null)
    setIsOpen(false)
  }

  return (
    <div className="sticky top-[57px] z-30 bg-gray-900 border-b border-gray-800 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex items-center gap-1 h-9 bg-gray-800 border-gray-700",
                  hasActiveFilters ? "border-teal-500 text-teal-400" : "text-gray-300",
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                Шүүх
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500 text-[10px] text-white font-medium ml-1">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl bg-gray-900 border-gray-800">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-teal-400" />
                    {title}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-gray-400 h-8">
                      Цэвэрлэх
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 h-8 p-0 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="py-4 space-y-5 overflow-auto">
                {categories.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300">Ангилал</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start h-9 text-xs bg-gray-800 border-gray-700",
                            selectedCategory === category.id
                              ? "border-teal-500 bg-teal-500/10 text-teal-400"
                              : "text-gray-300",
                          )}
                          onClick={() =>
                            onFilterChange("category", selectedCategory === category.id ? null : category.id)
                          }
                        >
                          {selectedCategory === category.id && <Check className="h-3 w-3 mr-1 text-teal-400" />}
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-800" />

                {levels.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300">Түвшин</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {levels.map((level) => (
                        <Button
                          key={level.id}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start h-9 text-xs bg-gray-800 border-gray-700",
                            selectedLevel === level.id
                              ? "border-teal-500 bg-teal-500/10 text-teal-400"
                              : "text-gray-300",
                          )}
                          onClick={() => onFilterChange("level", selectedLevel === level.id ? null : level.id)}
                        >
                          {selectedLevel === level.id && <Check className="h-3 w-3 mr-1 text-teal-400" />}
                          {level.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-800" />

                {types.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-300">Төрөл</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {types.map((type) => (
                        <Button
                          key={type.id}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start h-9 text-xs bg-gray-800 border-gray-700",
                            selectedType === type.id ? "border-teal-500 bg-teal-500/10 text-teal-400" : "text-gray-300",
                          )}
                          onClick={() => onFilterChange("type", selectedType === type.id ? null : type.id)}
                        >
                          {selectedType === type.id && <Check className="h-3 w-3 mr-1 text-teal-400" />}
                          {type.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-800">
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500"
                  onClick={() => setIsOpen(false)}
                >
                  Хэрэглэх ({totalItems} хичээл)
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-9 bg-gray-800 border-gray-700 text-gray-300"
              onClick={() => setSortOpen(!sortOpen)}
            >
              <span className="flex items-center">
                Бүх төрөл
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </span>
            </Button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50"
                >
                  <div className="py-1">
                    {types.map((type) => (
                      <button
                        key={type.id}
                        className={cn(
                          "flex items-center w-full px-3 py-2 text-sm",
                          selectedType === type.id ? "text-teal-400 bg-gray-700" : "text-gray-300 hover:bg-gray-700",
                        )}
                        onClick={() => {
                          onFilterChange("type", selectedType === type.id ? null : type.id)
                          setSortOpen(false)
                        }}
                      >
                        {selectedType === type.id && <Check className="h-3 w-3 mr-1" />}
                        {type.name}
                      </button>
                    ))}
                    <button
                      className={cn(
                        "flex items-center w-full px-3 py-2 text-sm",
                        !selectedType ? "text-teal-400 bg-gray-700" : "text-gray-300 hover:bg-gray-700",
                      )}
                      onClick={() => {
                        onFilterChange("type", null)
                        setSortOpen(false)
                      }}
                    >
                      {!selectedType && <Check className="h-3 w-3 mr-1" />}
                      Бүх төрөл
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 text-xs text-gray-300 bg-gray-800 border border-gray-700">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
            Эрэмбэлэх
          </Button>
          <span className="text-xs text-gray-400">{totalItems}</span>
        </div>
      </div>
    </div>
  )
}

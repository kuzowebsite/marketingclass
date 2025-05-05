"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface MobileHeaderProps {
  onSearch?: (query: string) => void
  searchQuery?: string
  showSearch?: boolean
  logo?: React.ReactNode
  className?: string
}

export function MobileHeader({ onSearch, searchQuery = "", showSearch = true, logo, className }: MobileHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(localSearchQuery)
    }
    setIsSearchOpen(false)
  }

  return (
    <header className={cn("sticky top-0 z-40 w-full bg-gray-900 border-b border-gray-800", className)}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center">
          {logo || (
            <Link href="/" className="flex items-center">
              <span className="text-teal-400 text-2xl mr-1">📚</span>
              <span className="font-bold text-white">MarketingClass</span>
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-300"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>
          )}

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSearch} className="p-3 border-t border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Хичээл хайх..."
                  className="pl-9 bg-gray-800 border-gray-700 text-white"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-lg z-50"
          >
            <nav className="py-3">
              <ul className="space-y-1 px-3">
                <li>
                  <Link
                    href="/"
                    className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Нүүр хуудас
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses"
                    className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Хичээлүүд
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Блог
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Сагс
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-3 rounded-lg text-white hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Профайл
                  </Link>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

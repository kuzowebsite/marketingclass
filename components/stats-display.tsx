"use client"

import { useEffect, useState } from "react"
import { getSiteStats, type SiteStats } from "@/lib/stats-service"

export function StatsDisplay() {
  const [stats, setStats] = useState<SiteStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCategories: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSiteStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="w-full bg-gradient-to-b from-teal-900/50 to-slate-900/90 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            value={isLoading ? "..." : `${stats.totalCourses}+`}
            label="Нийт хичээлүүд"
            color="from-cyan-500 to-blue-600"
          />
          <StatCard
            value={isLoading ? "..." : `${stats.totalStudents}+`}
            label="Суралцагчид"
            color="from-blue-500 to-indigo-600"
          />
          <StatCard
            value={isLoading ? "..." : `${stats.totalInstructors}+`}
            label="Багш нар"
            color="from-indigo-500 to-purple-600"
          />
          <StatCard
            value={isLoading ? "..." : `${stats.totalCategories}+`}
            label="Ангилалууд"
            color="from-purple-500 to-pink-600"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className={`relative rounded-lg overflow-hidden bg-slate-900 shadow-lg border border-slate-800`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20`}></div>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`}></div>
      <div className="p-6 relative z-10">
        <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{value}</h3>
        <p className="text-slate-300">{label}</p>
      </div>
    </div>
  )
}

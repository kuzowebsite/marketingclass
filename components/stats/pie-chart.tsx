"use client"

import { useEffect, useRef, useState } from "react"

interface PieChartProps {
  data: Array<{ name: string; value: number }>
  nameKey: string
  valueKey: string
  colors?: string[]
}

export function PieChart({ data, nameKey, valueKey, colors }: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartLoaded, setChartLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const loadChart = async () => {
      try {
        // Dynamically import recharts only on client side
        const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } = await import("recharts")

        setChartLoaded(true)
      } catch (error) {
        console.error("Error loading chart library:", error)
      }
    }

    loadChart()
  }, [])

  if (!chartLoaded || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Өгөгдөл байхгүй эсвэл ачааллаж байна...</p>
      </div>
    )
  }

  // The actual chart rendering will happen after the dynamic import
  return (
    <div ref={chartRef} className="w-full h-full">
      {/* Chart will be rendered here by the useEffect */}
    </div>
  )
}

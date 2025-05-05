"use client"

import { useEffect, useRef, useState } from "react"
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface BarChartProps {
  data: Array<{ [key: string]: any }>
  xKey: string
  yKey: string
  title?: string
  color?: string
}

export function BarChart({ data, xKey, yKey, title, color = "#3b82f6" }: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartLoaded, setChartLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const loadChart = async () => {
      try {
        // Dynamically import recharts only on client side
        const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = await import("recharts")

        setChartLoaded(true)
      } catch (error) {
        console.error("Error loading chart library:", error)
      }
    }

    loadChart()

    // This is a workaround for Recharts issue with SSR
    if (chartRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        window.dispatchEvent(new Event("resize"))
      })
      resizeObserver.observe(chartRef.current)
      return () => {
        if (chartRef.current) {
          resizeObserver.unobserve(chartRef.current)
        }
      }
    }
  }, [])

  // Format large numbers with commas
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value
  }

  if (!chartLoaded || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Өгөгдөл байхгүй эсвэл ачааллаж байна...</p>
      </div>
    )
  }

  return (
    <div ref={chartRef} className="h-full w-full">
      {data.length > 0 && chartLoaded ? (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey={xKey} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">{title || "Утга"}</span>
                          <span className="font-bold text-muted-foreground">{payload[0].value?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {xKey === "name" ? "Нэр" : xKey}
                          </span>
                          <span className="font-bold">{payload[0].payload[xKey]}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Мэдээлэл олдсонгүй</p>
        </div>
      )}
    </div>
  )
}

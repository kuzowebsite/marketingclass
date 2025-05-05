"use client"

import { useEffect, useRef, useState } from "react"

interface LineChartProps {
  data: Array<{ date: string; [key: string]: any }>
  xKey: string
  yKey: string
  title?: string
  color?: string
}

export function LineChart({ data, xKey, yKey, title, color = "#3b82f6" }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartLoaded, setChartLoaded] = useState(false)
  const [RechartsLineChart, setRechartsLineChart] = useState<any>(null)
  const [Line, setLine] = useState<any>(null)
  const [XAxis, setXAxis] = useState<any>(null)
  const [YAxis, setYAxis] = useState<any>(null)
  const [CartesianGrid, setCartesianGrid] = useState<any>(null)
  const [Tooltip, setTooltip] = useState<any>(null)
  const [ResponsiveContainer, setResponsiveContainer] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const loadChart = async () => {
      try {
        // Dynamically import recharts only on client side
        const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = await import("recharts")

        setChartLoaded(true)
        setRechartsLineChart(() => LineChart)
        setLine(() => Line)
        setXAxis(() => XAxis)
        setYAxis(() => YAxis)
        setCartesianGrid(() => CartesianGrid)
        setTooltip(() => Tooltip)
        setResponsiveContainer(() => ResponsiveContainer)
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
  // This is just a placeholder for the structure
  return (
    <div ref={chartRef} className="w-full h-full">
      {chartLoaded && data.length > 0 && RechartsLineChart && ResponsiveContainer && XAxis && YAxis && Line ? (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey={xKey} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`
                }
                return value
              }}
            />
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
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Огноо</span>
                          <span className="font-bold">{payload[0].payload[xKey]}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 0 }}
              dot={{ r: 0 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Мэдээлэл олдсонгүй</p>
        </div>
      )}
    </div>
  )
}

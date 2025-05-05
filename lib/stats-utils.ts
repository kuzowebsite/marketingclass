// Format date range for CSV filename
export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${startDate.toISOString().split("T")[0]}_to_${endDate.toISOString().split("T")[0]}`
}

// Generate date labels for charts
export function generateDateLabels(startDate: Date, endDate: Date): string[] {
  const labels: string[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    labels.push(currentDate.toISOString().split("T")[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return labels
}

// Export data to CSV
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0 || typeof window === "undefined") return

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Handle values that need quotes (strings with commas, etc.)
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Calculate growth percentage
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// Group data by time interval for better visualization
export function groupDataByTimeInterval(
  data: Array<{ date: string; [key: string]: any }>,
  startDate: Date,
  endDate: Date,
): Array<{ date: string; [key: string]: any }> {
  // Calculate date difference in days
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // If less than 30 days, return daily data
  if (diffDays <= 30) {
    return data
  }

  // If between 30 and 90 days, group by week
  if (diffDays <= 90) {
    return groupByWeek(data)
  }

  // If more than 90 days, group by month
  return groupByMonth(data)
}

// Group data by week
function groupByWeek(data: Array<{ date: string; [key: string]: any }>): Array<{ date: string; [key: string]: any }> {
  const weekMap = new Map<string, { date: string; [key: string]: any }>()

  data.forEach((item) => {
    const date = new Date(item.date)
    const year = date.getFullYear()
    const weekNumber = getWeekNumber(date)
    const weekKey = `${year}-W${weekNumber}`
    const weekLabel = `${year}-W${weekNumber}`

    if (!weekMap.has(weekKey)) {
      const newItem = { ...item, date: weekLabel }
      weekMap.set(weekKey, newItem)
    } else {
      const existingItem = weekMap.get(weekKey)!

      // Sum all numeric values
      Object.keys(item).forEach((key) => {
        if (key !== "date" && typeof item[key] === "number") {
          existingItem[key] = (existingItem[key] || 0) + item[key]
        }
      })
    }
  })

  return Array.from(weekMap.values())
}

// Group data by month
function groupByMonth(data: Array<{ date: string; [key: string]: any }>): Array<{ date: string; [key: string]: any }> {
  const monthMap = new Map<string, { date: string; [key: string]: any }>()

  data.forEach((item) => {
    const date = new Date(item.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`
    const monthLabel = `${year}-${month.toString().padStart(2, "0")}`

    if (!monthMap.has(monthKey)) {
      const newItem = { ...item, date: monthLabel }
      monthMap.set(monthKey, newItem)
    } else {
      const existingItem = monthMap.get(monthKey)!

      // Sum all numeric values
      Object.keys(item).forEach((key) => {
        if (key !== "date" && typeof item[key] === "number") {
          existingItem[key] = (existingItem[key] || 0) + item[key]
        }
      })
    }
  })

  return Array.from(monthMap.values())
}

// Get week number of the year
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

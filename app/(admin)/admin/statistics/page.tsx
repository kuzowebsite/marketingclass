"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ref, get } from "firebase/database"
import {
  BarChart3,
  Users,
  BookOpen,
  ShoppingBag,
  Download,
  Calendar,
  TrendingUp,
  Star,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { DatePicker } from "@/components/date-picker"
import { LineChart } from "@/components/stats/line-chart"
import { BarChart } from "@/components/stats/bar-chart"
import { PieChart } from "@/components/stats/pie-chart"
import {
  formatDateRange,
  generateDateLabels,
  exportToCSV,
  calculateGrowth,
  groupDataByTimeInterval,
} from "@/lib/stats-utils"
import type { User as UserType, Course, Order, Progress } from "@/lib/types"

type TimeFilter = "7d" | "30d" | "90d" | "1y" | "custom"
type StatTab = "users" | "courses" | "orders"

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<StatTab>("users")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d")
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // User statistics
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    new: 0,
    growth: 0,
    completionRate: 0,
    userGrowthData: [] as { date: string; count: number }[],
    activeUsersData: [] as { date: string; count: number }[],
    usersByActivity: [] as { name: string; value: number }[],
  })

  // Course statistics
  const [courseStats, setCourseStats] = useState({
    total: 0,
    new: 0,
    avgRating: 0,
    completionRate: 0,
    growth: 0,
    popularCourses: [] as { id: string; title: string; count: number }[],
    courseGrowthData: [] as { date: string; count: number }[],
    coursesByCategory: [] as { name: string; value: number }[],
    ratingDistribution: [] as { name: string; value: number }[],
  })

  // Order statistics
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    growth: 0,
    revenueGrowthData: [] as { date: string; value: number }[],
    ordersByStatus: [] as { name: string; value: number }[],
    monthlyRevenue: [] as { name: string; value: number }[],
  })

  const { user, db, loading: firebaseLoading } = useFirebase()
  const router = useRouter()

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !db) {
        if (!firebaseLoading) {
          router.push("/auth/admin-login")
        }
        return
      }

      try {
        const userRef = ref(db, `users/${user.uid}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          const userData = snapshot.val() as UserType
          if (userData.isAdmin) {
            setIsAdmin(true)
            fetchStatisticsData()
          } else {
            router.push("/")
          }
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/")
      }
    }

    checkAdminStatus()
  }, [user, db, router, firebaseLoading])

  // Update data when time filter changes
  useEffect(() => {
    if (isAdmin && db) {
      fetchStatisticsData()
    }
  }, [timeFilter, customStartDate, customEndDate, activeTab, isAdmin, db])

  // Get date range based on selected filter
  const getDateRange = () => {
    const endDate = new Date()
    let startDate = new Date()

    switch (timeFilter) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(endDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(endDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = customStartDate
          return { startDate, endDate: customEndDate }
        }
        // Default to 30 days if custom dates are not set
        startDate.setDate(endDate.getDate() - 30)
        break
    }

    return { startDate, endDate }
  }

  // Fetch all statistics data
  const fetchStatisticsData = async () => {
    if (!db) return

    setIsLoading(true)
    const { startDate, endDate } = getDateRange()
    const startTimestamp = startDate.getTime()
    const endTimestamp = endDate.getTime()

    try {
      // Fetch users data
      if (activeTab === "users" || activeTab === "courses") {
        const usersRef = ref(db, "users")
        const usersSnapshot = await get(usersRef)

        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val()
          const users = Object.values(usersData) as UserType[]

          // Filter users created within the date range
          const filteredUsers = users.filter(
            (user) => user.createdAt && user.createdAt >= startTimestamp && user.createdAt <= endTimestamp,
          )

          // Calculate user statistics
          const totalUsers = users.length
          const newUsers = filteredUsers.length

          // Active users (with progress)
          const activeUsers = users.filter((user) => user.progress && Object.keys(user.progress).length > 0).length

          // Calculate user growth compared to previous period
          const previousStartDate = new Date(startDate)
          previousStartDate.setDate(
            previousStartDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          )
          const previousStartTimestamp = previousStartDate.getTime()

          const previousPeriodUsers = users.filter(
            (user) => user.createdAt && user.createdAt >= previousStartTimestamp && user.createdAt < startTimestamp,
          ).length

          const userGrowth = calculateGrowth(newUsers, previousPeriodUsers)

          // Generate user growth data for chart
          const dateLabels = generateDateLabels(startDate, endDate)
          const userGrowthData = dateLabels.map((date) => {
            const dayStart = new Date(date)
            const dayEnd = new Date(date)
            dayEnd.setHours(23, 59, 59, 999)

            const count = users.filter(
              (user) => user.createdAt && user.createdAt >= dayStart.getTime() && user.createdAt <= dayEnd.getTime(),
            ).length

            return { date, count }
          })

          // Group data for better visualization if period is long
          const groupedUserGrowthData = groupDataByTimeInterval(userGrowthData, startDate, endDate)

          // Active users data for chart
          const activeUsersData = dateLabels.map((date) => {
            const dayStart = new Date(date)
            const dayEnd = new Date(date)
            dayEnd.setHours(23, 59, 59, 999)

            // Count users who had activity on this day (simplified - just checking if they have progress)
            const count = users.filter(
              (user) => user.lastActive && user.lastActive >= dayStart.getTime() && user.lastActive <= dayEnd.getTime(),
            ).length

            return { date, count }
          })

          const groupedActiveUsersData = groupDataByTimeInterval(activeUsersData, startDate, endDate)

          // User activity breakdown
          const usersByActivity = [
            { name: "Идэвхтэй", value: activeUsers },
            { name: "Идэвхгүй", value: totalUsers - activeUsers },
          ]

          // Calculate completion rate
          let completedCourses = 0
          let totalEnrollments = 0

          users.forEach((user) => {
            if (user.progress) {
              Object.values(user.progress).forEach((progress: Progress) => {
                totalEnrollments++
                if (progress.completed) {
                  completedCourses++
                }
              })
            }
          })

          const completionRate = totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0

          setUserStats({
            total: totalUsers,
            active: activeUsers,
            new: newUsers,
            growth: userGrowth,
            completionRate,
            userGrowthData: groupedUserGrowthData,
            activeUsersData: groupedActiveUsersData,
            usersByActivity,
          })
        }
      }

      // Fetch courses data
      if (activeTab === "courses") {
        const coursesRef = ref(db, "courses")
        const coursesSnapshot = await get(coursesRef)

        if (coursesSnapshot.exists()) {
          const coursesData = coursesSnapshot.val()
          const courses = Object.values(coursesData) as Course[]

          // Filter courses created within the date range
          const filteredCourses = courses.filter(
            (course) => course.createdAt && course.createdAt >= startTimestamp && course.createdAt <= endTimestamp,
          )

          const totalCourses = courses.length
          const newCourses = filteredCourses.length

          // Calculate course growth compared to previous period
          const previousStartDate = new Date(startDate)
          previousStartDate.setDate(
            previousStartDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          )
          const previousStartTimestamp = previousStartDate.getTime()

          const previousPeriodCourses = courses.filter(
            (course) =>
              course.createdAt && course.createdAt >= previousStartTimestamp && course.createdAt < startTimestamp,
          ).length

          const courseGrowth = calculateGrowth(newCourses, previousPeriodCourses)

          // Popular courses by view count
          const popularCourses = [...courses]
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 10)
            .map((course) => ({
              id: course.id,
              title: course.title,
              count: course.viewCount || 0,
            }))

          // Generate course growth data for chart
          const dateLabels = generateDateLabels(startDate, endDate)
          const courseGrowthData = dateLabels.map((date) => {
            const dayStart = new Date(date)
            const dayEnd = new Date(date)
            dayEnd.setHours(23, 59, 59, 999)

            const count = courses.filter(
              (course) =>
                course.createdAt && course.createdAt >= dayStart.getTime() && course.createdAt <= dayEnd.getTime(),
            ).length

            return { date, count }
          })

          // Group data for better visualization if period is long
          const groupedCourseGrowthData = groupDataByTimeInterval(courseGrowthData, startDate, endDate)

          // Courses by category
          const categoriesMap = new Map<string, number>()
          courses.forEach((course) => {
            const category = course.category || "Ангилалгүй"
            categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1)
          })

          const coursesByCategory = Array.from(categoriesMap.entries()).map(([name, value]) => ({ name, value }))

          // Rating distribution
          let totalRating = 0
          let ratingCount = 0
          const ratingCounts = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 }

          courses.forEach((course) => {
            if (course.ratings) {
              Object.values(course.ratings).forEach((rating) => {
                totalRating += rating
                ratingCount++
                ratingCounts[rating.toString()]++
              })
            }
          })

          const avgRating = ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0

          const ratingDistribution = Object.entries(ratingCounts)
            .map(([rating, count]) => ({
              name: `${rating} од`,
              value: count,
            }))
            .reverse() // Reverse to show 5 stars first

          // Calculate completion rate for courses
          let completedLessons = 0
          let totalLessons = 0

          courses.forEach((course) => {
            if (course.lessons) {
              Object.values(course.lessons).forEach((lesson) => {
                totalLessons++
                if (lesson.completions) {
                  completedLessons += Object.keys(lesson.completions).length
                }
              })
            }
          })

          const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

          setCourseStats({
            total: totalCourses,
            new: newCourses,
            avgRating,
            completionRate,
            growth: courseGrowth,
            popularCourses,
            courseGrowthData: groupedCourseGrowthData,
            coursesByCategory,
            ratingDistribution,
          })
        }
      }

      // Fetch orders data
      if (activeTab === "orders") {
        const ordersRef = ref(db, "orders")
        const ordersSnapshot = await get(ordersRef)

        if (ordersSnapshot.exists()) {
          const ordersData = ordersSnapshot.val()
          const orders = Object.values(ordersData) as Order[]

          // Filter orders created within the date range
          const filteredOrders = orders.filter(
            (order) => order.createdAt >= startTimestamp && order.createdAt <= endTimestamp,
          )

          const totalOrders = filteredOrders.length
          const completedOrders = filteredOrders.filter((order) => order.status === "completed").length
          const pendingOrders = filteredOrders.filter((order) => order.status === "pending").length
          const cancelledOrders = filteredOrders.filter((order) => order.status === "cancelled").length

          // Calculate total revenue and average order value
          const totalRevenue = filteredOrders
            .filter((order) => order.status === "completed")
            .reduce((sum, order) => sum + order.totalAmount, 0)

          const avgOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0

          // Calculate order growth compared to previous period
          const previousStartDate = new Date(startDate)
          previousStartDate.setDate(
            previousStartDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          )
          const previousStartTimestamp = previousStartDate.getTime()

          const previousPeriodOrders = orders.filter(
            (order) => order.createdAt >= previousStartTimestamp && order.createdAt < startTimestamp,
          ).length

          const orderGrowth = calculateGrowth(totalOrders, previousPeriodOrders)

          // Generate revenue growth data for chart
          const dateLabels = generateDateLabels(startDate, endDate)
          const revenueGrowthData = dateLabels.map((date) => {
            const dayStart = new Date(date)
            const dayEnd = new Date(date)
            dayEnd.setHours(23, 59, 59, 999)

            const dayRevenue = orders
              .filter(
                (order) =>
                  order.status === "completed" &&
                  order.createdAt >= dayStart.getTime() &&
                  order.createdAt <= dayEnd.getTime(),
              )
              .reduce((sum, order) => sum + order.totalAmount, 0)

            return { date, value: dayRevenue }
          })

          // Group data for better visualization if period is long
          const groupedRevenueGrowthData = groupDataByTimeInterval(revenueGrowthData, startDate, endDate)

          // Orders by status
          const ordersByStatus = [
            { name: "Баталгаажсан", value: completedOrders },
            { name: "Хүлээгдэж буй", value: pendingOrders },
            { name: "Цуцлагдсан", value: cancelledOrders },
          ]

          // Monthly revenue for bar chart
          const monthlyRevenueMap = new Map<string, number>()

          filteredOrders
            .filter((order) => order.status === "completed")
            .forEach((order) => {
              const date = new Date(order.createdAt)
              const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`
              const monthName = date.toLocaleString("mn-MN", { month: "short" })

              monthlyRevenueMap.set(monthName, (monthlyRevenueMap.get(monthName) || 0) + order.totalAmount)
            })

          const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => {
              const months = [
                "1-р сар",
                "2-р сар",
                "3-р сар",
                "4-р сар",
                "5-р сар",
                "6-р сар",
                "7-р сар",
                "8-р сар",
                "9-р сар",
                "10-р сар",
                "11-р сар",
                "12-р сар",
              ]
              return months.indexOf(a.name) - months.indexOf(b.name)
            })

          setOrderStats({
            total: totalOrders,
            completed: completedOrders,
            pending: pendingOrders,
            cancelled: cancelledOrders,
            totalRevenue,
            avgOrderValue,
            growth: orderGrowth,
            revenueGrowthData: groupedRevenueGrowthData,
            ordersByStatus,
            monthlyRevenue,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching statistics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as StatTab)
  }

  // Handle time filter change
  const handleTimeFilterChange = (value: TimeFilter) => {
    setTimeFilter(value)
  }

  // Handle custom date change
  const handleCustomDateChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    setCustomStartDate(startDate)
    setCustomEndDate(endDate)
    if (startDate && endDate) {
      setTimeFilter("custom")
    }
  }

  // Export data to CSV
  const handleExportCSV = () => {
    if (typeof window === "undefined") return

    const { startDate, endDate } = getDateRange()
    let data: any[] = []
    let filename = ""

    switch (activeTab) {
      case "users":
        data = userStats.userGrowthData.map((item) => ({
          Date: item.date,
          "New Users": item.count,
        }))
        filename = `user_statistics_${formatDateRange(startDate, endDate)}.csv`
        break
      case "courses":
        data = courseStats.popularCourses.map((course) => ({
          "Course Title": course.title,
          Views: course.count,
        }))
        filename = `course_statistics_${formatDateRange(startDate, endDate)}.csv`
        break
      case "orders":
        data = orderStats.revenueGrowthData.map((item) => ({
          Date: item.date,
          Revenue: item.value,
        }))
        filename = `order_statistics_${formatDateRange(startDate, endDate)}.csv`
        break
    }

    exportToCSV(data, filename)
  }

  if (firebaseLoading || !isAdmin) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Дэлгэрэнгүй статистик</h1>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <Button
              variant={timeFilter === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeFilterChange("7d")}
            >
              7 хоног
            </Button>
            <Button
              variant={timeFilter === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeFilterChange("30d")}
            >
              30 хоног
            </Button>
            <Button
              variant={timeFilter === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeFilterChange("90d")}
            >
              90 хоног
            </Button>
            <Button
              variant={timeFilter === "1y" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeFilterChange("1y")}
            >
              1 жил
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DatePicker startDate={customStartDate} endDate={customEndDate} onUpdate={handleCustomDateChange} />

            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Хэрэглэгчид
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Хичээлүүд
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Захиалгууд
          </TabsTrigger>
        </TabsList>

        {/* Users Statistics */}
        <TabsContent value="users">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Нийт хэрэглэгч</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats.total}</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Бүртгэлтэй хэрэглэгчид</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Шинэ хэрэглэгч</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats.new}</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Энэ хугацаанд</p>
                      <p
                        className={`text-xs flex items-center ${userStats.growth > 0 ? "text-green-600" : userStats.growth < 0 ? "text-red-600" : "text-gray-500"}`}
                      >
                        {userStats.growth > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : userStats.growth < 0 ? (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        ) : null}
                        {Math.abs(userStats.growth)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Идэвхтэй хэрэглэгч</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats.active}</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Идэвхтэй хэрэглэгчид</p>
                      <p className="text-xs text-green-600">
                        {userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Төгсөлтийн хувь</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats.completionRate}%</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Хичээл төгссөн</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Хэрэглэгчийн өсөлт</CardTitle>
                    <CardDescription>
                      {timeFilter === "custom" && customStartDate && customEndDate
                        ? `${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`
                        : timeFilter === "7d"
                          ? "Сүүлийн 7 хоног"
                          : timeFilter === "30d"
                            ? "Сүүлийн 30 хоног"
                            : timeFilter === "90d"
                              ? "Сүүлийн 90 хоног"
                              : "Сүүлийн 1 жил"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <LineChart data={userStats.userGrowthData} xKey="date" yKey="count" title="Шинэ хэрэглэгчид" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Хэрэглэгчийн идэвх</CardTitle>
                    <CardDescription>Идэвхтэй ба идэвхгүй хэрэглэгчид</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <PieChart
                      data={userStats.usersByActivity}
                      nameKey="name"
                      valueKey="value"
                      colors={["#22c55e", "#e2e8f0"]}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Идэвхтэй хэрэглэгчид</CardTitle>
                    <CardDescription>Өдөр тутмын идэвхтэй хэрэглэгчдийн тоо</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <LineChart
                      data={userStats.activeUsersData}
                      xKey="date"
                      yKey="count"
                      title="Идэвхтэй хэрэглэгчид"
                      color="#8b5cf6"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Хэрэглэгчийн ахиц</CardTitle>
                    <CardDescription>Хичээл төгсөлтийн статистик</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Төгсөлтийн хувь</p>
                            <p className="text-xs text-muted-foreground">Хэрэглэгчдийн хичээл төгсөлтийн хувь</p>
                          </div>
                          <p className="text-2xl font-bold">{userStats.completionRate}%</p>
                        </div>
                        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${userStats.completionRate}%` }} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Идэвхтэй хэрэглэгчдийн хувь</p>
                            <p className="text-xs text-muted-foreground">Нийт хэрэглэгчдийн дунд</p>
                          </div>
                          <p className="text-2xl font-bold">
                            {userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}%
                          </p>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Courses Statistics */}
        <TabsContent value="courses">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Нийт хичээл</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{courseStats.total}</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Бүртгэлтэй хичээлүүд</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Шинэ хичээл</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{courseStats.new}</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Энэ хугацаанд</p>
                      <p
                        className={`text-xs flex items-center ${courseStats.growth > 0 ? "text-green-600" : courseStats.growth < 0 ? "text-red-600" : "text-gray-500"}`}
                      >
                        {courseStats.growth > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : courseStats.growth < 0 ? (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        ) : null}
                        {Math.abs(courseStats.growth)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Дундаж үнэлгээ</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{courseStats.avgRating}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= Math.round(courseStats.avgRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Төгсөлтийн хувь</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{courseStats.completionRate}%</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Хичээл төгссөн</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Хичээлийн өсөлт</CardTitle>
                    <CardDescription>
                      {timeFilter === "custom" && customStartDate && customEndDate
                        ? `${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`
                        : timeFilter === "7d"
                          ? "Сүүлийн 7 хоног"
                          : timeFilter === "30d"
                            ? "Сүүлийн 30 хоног"
                            : timeFilter === "90d"
                              ? "Сүүлийн 90 хоног"
                              : "Сүүлийн 1 жил"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <LineChart
                      data={courseStats.courseGrowthData}
                      xKey="date"
                      yKey="count"
                      title="Шинэ хичээлүүд"
                      color="#10b981"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Хичээлийн ангилал</CardTitle>
                    <CardDescription>Ангилал бүрийн хичээлийн тоо</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <PieChart data={courseStats.coursesByCategory} nameKey="name" valueKey="value" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Эрэлттэй хичээлүүд</CardTitle>
                    <CardDescription>Хамгийн их үзэлттэй хичээлүүд</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courseStats.popularCourses.slice(0, 5).map((course, index) => (
                        <div key={course.id} className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0
                                ? "bg-amber-100 text-amber-700"
                                : index === 1
                                  ? "bg-slate-100 text-slate-700"
                                  : index === 2
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium truncate">{course.title}</p>
                            <p className="text-sm text-muted-foreground">{course.count} үзэлт</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Үнэлгээний тархалт</CardTitle>
                    <CardDescription>Хичээлүүдийн үнэлгээний тархалт</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <BarChart
                      data={courseStats.ratingDistribution}
                      xKey="name"
                      yKey="value"
                      title="Үнэлгээ"
                      color="#f59e0b"
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Orders Statistics */}
        <TabsContent value="orders">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Нийт захиалга</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orderStats.total}</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Энэ хугацаанд</p>
                      <p
                        className={`text-xs flex items-center ${orderStats.growth > 0 ? "text-green-600" : orderStats.growth < 0 ? "text-red-600" : "text-gray-500"}`}
                      >
                        {orderStats.growth > 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : orderStats.growth < 0 ? (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        ) : null}
                        {Math.abs(orderStats.growth)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Нийт орлого</CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-700">{orderStats.totalRevenue.toLocaleString()}₮</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-green-600">Баталгаажсан захиалгууд</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Дундаж захиалга</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orderStats.avgOrderValue.toLocaleString()}₮</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Захиалга бүрт</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Баталгаажсан</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orderStats.completed}</div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">Баталгаажсан захиалга</p>
                      <p className="text-xs text-green-600">
                        {orderStats.total > 0 ? Math.round((orderStats.completed / orderStats.total) * 100) : 0}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Орлогын өсөлт</CardTitle>
                    <CardDescription>
                      {timeFilter === "custom" && customStartDate && customEndDate
                        ? `${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`
                        : timeFilter === "7d"
                          ? "Сүүлийн 7 хоног"
                          : timeFilter === "30d"
                            ? "Сүүлийн 30 хоног"
                            : timeFilter === "90d"
                              ? "Сүүлийн 90 хоног"
                              : "Сүүлийн 1 жил"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <LineChart
                      data={orderStats.revenueGrowthData}
                      xKey="date"
                      yKey="value"
                      title="Орлого (₮)"
                      color="#10b981"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Захиалгын төлөв</CardTitle>
                    <CardDescription>Захиалгын төлвийн харьцаа</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <PieChart
                      data={orderStats.ordersByStatus}
                      nameKey="name"
                      valueKey="value"
                      colors={["#22c55e", "#eab308", "#ef4444"]}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Сарын орлого</CardTitle>
                    <CardDescription>Сар бүрийн орлогын харьцуулалт</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <BarChart
                      data={orderStats.monthlyRevenue}
                      xKey="name"
                      yKey="value"
                      title="Орлого (₮)"
                      color="#8b5cf6"
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

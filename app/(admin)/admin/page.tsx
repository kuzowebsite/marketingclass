"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, BookOpen, ShoppingCart, LineChart, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import Link from "next/link"
import { getDatabase, ref, get } from "firebase/database"
import { app } from "@/lib/firebase/firebase-config"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart } from "@/components/stats/bar-chart"
import { LineChart as LineChartComponent } from "@/components/stats/line-chart"
import { PieChart } from "@/components/stats/pie-chart"

// Define types for our data
interface User {
  id: string
  email: string
  displayName?: string
  lastActive?: number
  isAdmin?: boolean
  createdAt?: number
}

interface Course {
  id: string
  title: string
  description: string
  price: number
  createdAt: number
  viewCount?: number
}

interface Order {
  id: string
  userId: string
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  createdAt: number
  items: Array<{
    courseId: string
    price: number
  }>
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [] as Order[],
    userGrowth: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    popularCourses: [] as { id: string; title: string; count: number }[],
    userGrowthData: [] as { date: string; count: number }[],
    revenueData: [] as { name: string; value: number }[],
    orderStatusData: [] as { name: string; value: number }[],
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        if (!app) {
          console.error("Firebase app is not initialized")
          setLoading(false)
          return
        }

        const db = getDatabase(app)

        // Fetch users data
        const usersSnapshot = await get(ref(db, "users"))
        const users = usersSnapshot.exists()
          ? Object.entries(usersSnapshot.val()).map(([id, data]) => ({
              id,
              ...(data as Omit<User, "id">),
            }))
          : []
        const totalUsers = users.length

        // Calculate active users (users who were active in the last 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        const activeUsers = users.filter((user) => user.lastActive && user.lastActive > sevenDaysAgo).length

        // Calculate user growth (new users in the last 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000

        const newUsersLast30Days = users.filter((user) => user.createdAt && user.createdAt > thirtyDaysAgo).length
        const newUsersPrevious30Days = users.filter(
          (user) => user.createdAt && user.createdAt > sixtyDaysAgo && user.createdAt < thirtyDaysAgo,
        ).length

        const userGrowth =
          newUsersPrevious30Days > 0
            ? Math.round(((newUsersLast30Days - newUsersPrevious30Days) / newUsersPrevious30Days) * 100)
            : newUsersLast30Days > 0
              ? 100
              : 0

        // Generate user growth data for chart
        const userGrowthData = generateTimeSeriesData(users, 7, (user) => user.createdAt || 0)

        // Fetch courses data
        const coursesSnapshot = await get(ref(db, "courses"))
        const courses = coursesSnapshot.exists()
          ? Object.entries(coursesSnapshot.val()).map(([id, data]) => ({
              id,
              ...(data as Omit<Course, "id">),
            }))
          : []
        const totalCourses = courses.length

        // Get popular courses
        const popularCourses = [...courses]
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 5)
          .map((course) => ({
            id: course.id,
            title: course.title,
            count: course.viewCount || 0,
          }))

        // Fetch orders data
        const ordersSnapshot = await get(ref(db, "orders"))
        const orders = ordersSnapshot.exists()
          ? Object.entries(ordersSnapshot.val()).map(([id, data]) => ({
              id,
              ...(data as Omit<Order, "id">),
            }))
          : []

        const totalOrders = orders.length

        // Calculate order growth
        const ordersLast30Days = orders.filter((order) => order.createdAt > thirtyDaysAgo).length
        const ordersPrevious30Days = orders.filter(
          (order) => order.createdAt > sixtyDaysAgo && order.createdAt < thirtyDaysAgo,
        ).length

        const orderGrowth =
          ordersPrevious30Days > 0
            ? Math.round(((ordersLast30Days - ordersPrevious30Days) / ordersPrevious30Days) * 100)
            : ordersLast30Days > 0
              ? 100
              : 0

        // Calculate total revenue from completed orders
        const completedOrders = orders.filter((order) => order.status === "completed")
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)

        // Calculate revenue growth
        const revenueLast30Days = completedOrders
          .filter((order) => order.createdAt > thirtyDaysAgo)
          .reduce((sum, order) => sum + order.totalAmount, 0)

        const revenuePrevious30Days = completedOrders
          .filter((order) => order.createdAt > sixtyDaysAgo && order.createdAt < thirtyDaysAgo)
          .reduce((sum, order) => sum + order.totalAmount, 0)

        const revenueGrowth =
          revenuePrevious30Days > 0
            ? Math.round(((revenueLast30Days - revenuePrevious30Days) / revenuePrevious30Days) * 100)
            : revenueLast30Days > 0
              ? 100
              : 0

        // Get recent orders (last 5)
        const recentOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)

        // Generate revenue data for chart
        const revenueData = generateMonthlyRevenueData(completedOrders)

        // Generate order status data for pie chart
        const pendingOrders = orders.filter((order) => order.status === "pending").length
        const cancelledOrders = orders.filter((order) => order.status === "cancelled").length

        const orderStatusData = [
          { name: "Баталгаажсан", value: completedOrders.length },
          { name: "Хүлээгдэж буй", value: pendingOrders },
          { name: "Цуцлагдсан", value: cancelledOrders },
        ]

        setStats({
          totalUsers,
          activeUsers,
          totalCourses,
          totalOrders,
          totalRevenue,
          recentOrders,
          userGrowth,
          orderGrowth,
          revenueGrowth,
          popularCourses,
          userGrowthData,
          revenueData,
          orderStatusData,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Generate time series data for charts
  const generateTimeSeriesData = (data: any[], days: number, getTimestamp: (item: any) => number) => {
    const result = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = data.filter((item) => {
        const timestamp = getTimestamp(item)
        return timestamp >= date.getTime() && timestamp < nextDate.getTime()
      }).length

      result.push({
        date: date.toLocaleDateString("mn-MN", { month: "short", day: "numeric" }),
        count,
      })
    }

    return result
  }

  // Generate monthly revenue data
  const generateMonthlyRevenueData = (orders: Order[]) => {
    const monthlyData: Record<string, number> = {}

    orders.forEach((order) => {
      const date = new Date(order.createdAt)
      const monthYear = date.toLocaleDateString("mn-MN", { month: "short" })

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0
      }

      monthlyData[monthYear] += order.totalAmount
    })

    return Object.entries(monthlyData)
      .map(([name, value]) => ({ name, value }))
      .slice(-6) // Last 6 months
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("mn-MN").format(amount) + "₮"
  }

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* User Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              Нийт хэрэглэгч
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Идэвхтэй: {stats.activeUsers}</p>
                <p
                  className={`text-xs flex items-center ${stats.userGrowth > 0 ? "text-green-500" : stats.userGrowth < 0 ? "text-red-500" : "text-gray-500"}`}
                >
                  {stats.userGrowth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : stats.userGrowth < 0 ? (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  ) : null}
                  {stats.userGrowth}% сүүлийн 30 хоногт
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/users" className="text-sm text-primary hover:underline flex items-center">
              Харах <span className="ml-1">→</span>
            </Link>
          </CardFooter>
        </Card>

        {/* Course Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
              Нийт хичээл
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">Хичээлүүд</p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/courses" className="text-sm text-primary hover:underline flex items-center">
              Харах <span className="ml-1">→</span>
            </Link>
          </CardFooter>
        </Card>

        {/* Order Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
              Нийт захиалга
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p
                  className={`text-xs flex items-center ${stats.orderGrowth > 0 ? "text-green-500" : stats.orderGrowth < 0 ? "text-red-500" : "text-gray-500"}`}
                >
                  {stats.orderGrowth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : stats.orderGrowth < 0 ? (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  ) : null}
                  {stats.orderGrowth}% сүүлийн 30 хоногт
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline flex items-center">
              Харах <span className="ml-1">→</span>
            </Link>
          </CardFooter>
        </Card>

        {/* Revenue Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <LineChart className="mr-2 h-4 w-4 text-muted-foreground" />
              Нийт орлого
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p
                  className={`text-xs flex items-center ${stats.revenueGrowth > 0 ? "text-green-500" : stats.revenueGrowth < 0 ? "text-red-500" : "text-gray-500"}`}
                >
                  {stats.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : stats.revenueGrowth < 0 ? (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  ) : null}
                  {stats.revenueGrowth}% сүүлийн 30 хоногт
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/admin/statistics" className="text-sm text-primary hover:underline flex items-center">
              Дэлгэрэнгүй <span className="ml-1">→</span>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Ерөнхий</TabsTrigger>
          <TabsTrigger value="analytics">Аналитик</TabsTrigger>
          <TabsTrigger value="orders">Захиалгууд</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Хэрэглэгчийн өсөлт</CardTitle>
                <CardDescription>Сүүлийн 7 хоногийн хэрэглэгчийн өсөлт</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <LineChartComponent data={stats.userGrowthData} xKey="date" yKey="count" title="Шинэ хэрэглэгчид" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Эрэлттэй хичээлүүд</CardTitle>
                <CardDescription>Хамгийн их үзэлттэй хичээлүүд</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : stats.popularCourses.length > 0 ? (
                  <div className="space-y-4">
                    {stats.popularCourses.map((course, index) => (
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
                ) : (
                  <p className="text-center text-muted-foreground py-8">Мэдээлэл олдсонгүй</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Сарын орлого</CardTitle>
                <CardDescription>Сар бүрийн орлогын харьцуулалт</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <BarChart data={stats.revenueData} xKey="name" yKey="value" title="Орлого (₮)" color="#8b5cf6" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Захиалгын төлөв</CardTitle>
                <CardDescription>Захиалгын төлвийн харьцаа</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <PieChart
                    data={stats.orderStatusData}
                    nameKey="name"
                    valueKey="value"
                    colors={["#22c55e", "#eab308", "#ef4444"]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Дэлгэрэнгүй аналитик</CardTitle>
              <CardDescription>Дэлгэрэнгүй статистик мэдээлэл</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
                <h3 className="mt-4 text-lg font-medium">Дэлгэрэнгүй статистик</h3>
                <p className="text-muted-foreground mt-2">
                  Дэлгэрэнгүй статистик мэдээлэл харахын тулд доорх товчийг дарна уу
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/admin/statistics">Дэлгэрэнгүй статистик</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Сүүлийн захиалгууд</CardTitle>
              <CardDescription>Сүүлд хийгдсэн захиалгууд</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : stats.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">ID</th>
                        <th className="text-left p-4">Хэрэглэгч</th>
                        <th className="text-left p-4">Төлбөр</th>
                        <th className="text-left p-4">Төлөв</th>
                        <th className="text-left p-4">Огноо</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-mono text-sm">{order.id.substring(0, 8)}...</td>
                          <td className="p-4">{order.userId.substring(0, 8)}...</td>
                          <td className="p-4">{formatCurrency(order.totalAmount)}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.status === "completed"
                                ? "Баталгаажсан"
                                : order.status === "pending"
                                  ? "Хүлээгдэж буй"
                                  : "Цуцлагдсан"}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(order.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Захиалга олдсонгүй</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/admin/orders">Бүх захиалга харах</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

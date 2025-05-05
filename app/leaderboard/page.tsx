"use client"

import { useEffect, useState } from "react"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { LeaderboardEntry, User } from "@/lib/types"
import {
  Trophy,
  Medal,
  Award,
  Star,
  BookOpen,
  Clock,
  Target,
  Zap,
  Crown,
  ChevronRight,
  Users,
  Sparkles,
} from "lucide-react"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("all-time")
  const { db } = useFirebase()

  useEffect(() => {
    // Check if we're in development mode with dev admin access
    const devModeAdminAccess = localStorage.getItem("devModeAdminAccess")
    if (process.env.NODE_ENV === "development" && devModeAdminAccess === "true") {
      console.log("Dev mode admin access detected in leaderboard page")
      // No need to redirect, just log for debugging
    }
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!db) return

      try {
        const usersRef = ref(db, "users")
        const snapshot = await get(usersRef)

        if (snapshot.exists()) {
          const users = snapshot.val() as Record<string, User>

          const leaderboardData: LeaderboardEntry[] = Object.values(users)
            .map((user) => {
              const completedCourses = user.progress
                ? Object.keys(user.progress).filter((courseId) => {
                    const courseLessons = user.progress![courseId]
                    return Object.values(courseLessons).every(Boolean)
                  }).length
                : 0

              // Calculate streak (mock data for demonstration)
              const streak = Math.floor(Math.random() * 30) + 1

              // Calculate weekly points (mock data)
              const weeklyPoints = Math.floor(Math.random() * 500) + 100

              // Calculate monthly points (mock data)
              const monthlyPoints = Math.floor(Math.random() * 2000) + 500

              return {
                userId: user.uid,
                userName: user.displayName || "Хэрэглэгч",
                points: user.points || 0,
                weeklyPoints,
                monthlyPoints,
                completedCourses,
                badges: user.badges ? user.badges.length : 0,
                streak,
                level: calculateLevel(user.points || 0),
                profileImage: user.photoURL || "",
              }
            })
            .sort((a, b) => {
              if (timeframe === "weekly") {
                return b.weeklyPoints - a.weeklyPoints
              } else if (timeframe === "monthly") {
                return b.monthlyPoints - a.monthlyPoints
              }
              return b.points - a.points
            })
            .slice(0, 50) // Get top 50 users

          setLeaderboard(leaderboardData)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [db, timeframe])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const calculateLevel = (points: number) => {
    // Simple level calculation based on points
    return Math.floor(points / 500) + 1
  }

  const getProgressToNextLevel = (points: number) => {
    const currentLevel = calculateLevel(points)
    const pointsForCurrentLevel = (currentLevel - 1) * 500
    const pointsForNextLevel = currentLevel * 500
    const progress = ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const getBadgeIcon = (index: number) => {
    const icons = [
      <Trophy key="trophy" className="h-5 w-5" />,
      <Star key="star" className="h-5 w-5" />,
      <BookOpen key="book" className="h-5 w-5" />,
      <Target key="target" className="h-5 w-5" />,
      <Zap key="zap" className="h-5 w-5" />,
    ]
    return icons[index % icons.length]
  }

  const getRandomBadges = (count: number) => {
    const badgeTypes = [
      { name: "Мастер", color: "bg-yellow-500" },
      { name: "Шилдэг", color: "bg-blue-500" },
      { name: "Тэргүүн", color: "bg-green-500" },
      { name: "Мэргэн", color: "bg-purple-500" },
      { name: "Хурдан", color: "bg-red-500" },
    ]

    const badges = []
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * badgeTypes.length)
      badges.push(badgeTypes[randomIndex])
    }
    return badges
  }

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-background pt-16 pb-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl"></div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="inline-block">
                <Crown className="inline-block h-10 w-10 text-yellow-500 mr-2 mb-1" />
                Шилдэг суралцагчид
              </span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Хамгийн идэвхтэй, олон хичээл дуусгасан, өндөр оноо цуглуулсан суралцагчид
            </p>

            <div className="mt-8 flex justify-center">
              <Tabs defaultValue="all-time" className="w-full max-w-md" onValueChange={setTimeframe}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all-time">Бүх цаг</TabsTrigger>
                  <TabsTrigger value="monthly">Сарын</TabsTrigger>
                  <TabsTrigger value="weekly">Долоо хоногийн</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container py-12">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Одоогоор мэдээлэл байхгүй байна</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Top 3 users */}
            <div>
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
                Тэргүүлэгчид
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                {leaderboard.slice(0, 3).map((entry, index) => {
                  const icons = [
                    <Trophy key="trophy" className="h-12 w-12 text-yellow-500" />,
                    <Medal key="medal" className="h-12 w-12 text-gray-400" />,
                    <Award key="award" className="h-12 w-12 text-amber-700" />,
                  ]

                  const colors = [
                    "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
                    "bg-gradient-to-br from-gray-300/20 to-gray-400/20 border-gray-400/30",
                    "bg-gradient-to-br from-amber-700/20 to-amber-800/20 border-amber-700/30",
                  ]

                  const shadowColors = [
                    "shadow-lg shadow-yellow-500/10",
                    "shadow-lg shadow-gray-400/10",
                    "shadow-lg shadow-amber-700/10",
                  ]

                  const badges = getRandomBadges(entry.badges)

                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className={`border-2 ${colors[index]} ${shadowColors[index]} overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-24 h-24">
                          <div className="absolute transform rotate-45 bg-gradient-to-br from-primary to-primary/80 text-white text-xs font-bold py-1 right-[-35px] top-[20px] w-[170px] text-center">
                            #{index + 1} байр
                          </div>
                        </div>

                        <CardHeader className="text-center pb-2 pt-8">
                          <div className="flex justify-center mb-4">{icons[index]}</div>
                          <div className="flex justify-center mb-4 relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/60 to-blue-500/60 blur-lg opacity-70"></div>
                            <Avatar className="h-24 w-24 border-4 border-background relative">
                              {entry.profileImage ? (
                                <AvatarImage src={entry.profileImage || "/placeholder.svg"} alt={entry.userName} />
                              ) : (
                                <AvatarFallback className="text-2xl bg-primary/10">
                                  {getInitials(entry.userName)}
                                </AvatarFallback>
                              )}
                              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                                <div className="bg-primary text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">
                                  {entry.level}
                                </div>
                              </div>
                            </Avatar>
                          </div>
                          <CardTitle className="text-xl">{entry.userName}</CardTitle>
                          <CardDescription className="text-sm">
                            {timeframe === "weekly" ? (
                              <span>Энэ долоо хоногт {entry.weeklyPoints} оноо</span>
                            ) : timeframe === "monthly" ? (
                              <span>Энэ сард {entry.monthlyPoints} оноо</span>
                            ) : (
                              <span>Нийт {entry.points} оноо</span>
                            )}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="text-center">
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-background/50 rounded-lg p-2">
                              <p className="text-2xl font-bold">{entry.completedCourses}</p>
                              <p className="text-xs text-muted-foreground">Курс</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-2">
                              <p className="text-2xl font-bold">{entry.badges}</p>
                              <p className="text-xs text-muted-foreground">Шагнал</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-2">
                              <p className="text-2xl font-bold">{entry.streak}</p>
                              <p className="text-xs text-muted-foreground">Өдөр</p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Түвшин {entry.level}</span>
                              <span>Түвшин {entry.level + 1}</span>
                            </div>
                            <Progress value={getProgressToNextLevel(entry.points)} className="h-2" />
                          </div>

                          {badges.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1 justify-center">
                              {badges.map((badge, i) => (
                                <Badge key={i} className={`${badge.color} text-white`}>
                                  {getBadgeIcon(i)}
                                  <span className="ml-1">{badge.name}</span>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Rest of the leaderboard */}
            <div>
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <Users className="h-6 w-6 text-primary mr-2" />
                Шилдэг 50 суралцагч
              </h2>

              <Card className="overflow-hidden border-primary/20">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-xl">Шилдэг суралцагчдын жагсаалт</CardTitle>
                  <CardDescription>
                    {timeframe === "weekly"
                      ? "Долоо хоногийн"
                      : timeframe === "monthly"
                        ? "Сарын"
                        : "Бүх цаг хугацааны"}{" "}
                    шилдэг суралцагчид
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {leaderboard.slice(3).map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: (index % 10) * 0.05 }}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground">
                            {index + 4}
                          </div>

                          <Avatar className="h-12 w-12 border-2 border-muted">
                            {entry.profileImage ? (
                              <AvatarImage src={entry.profileImage || "/placeholder.svg"} alt={entry.userName} />
                            ) : (
                              <AvatarFallback>{getInitials(entry.userName)}</AvatarFallback>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                              <div className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {entry.level}
                              </div>
                            </div>
                          </Avatar>

                          <div>
                            <p className="font-medium">{entry.userName}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <BookOpen className="h-3 w-3 mr-1" />
                              <span>{entry.completedCourses} курс</span>
                              <span className="mx-1">•</span>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{entry.streak} өдөр</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex items-center">
                          <div className="mr-4">
                            <p className="font-bold text-lg">
                              {timeframe === "weekly"
                                ? entry.weeklyPoints
                                : timeframe === "monthly"
                                  ? entry.monthlyPoints
                                  : entry.points}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.badges} шагнал</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call to action */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Та ч бас шилдэг суралцагч болох боломжтой!</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Өдөр бүр хичээлээ үзэж, даалгавраа хийж, шалгалтаа өгснөөр оноо цуглуулж, шагнал авах боломжтой.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Хичээлүүдийг үзэх
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

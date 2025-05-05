"use client"

import { useEffect, useState } from "react"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { useCart } from "@/lib/cart/cart-provider"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import type { Course } from "@/lib/types"
import { getSiteStats, type SiteStats } from "@/lib/stats-service"
import {
  ShoppingCart,
  Search,
  Users,
  BarChart3,
  Star,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  BookOpen,
  Award,
  Clock,
} from "lucide-react"

export default function IndividualPage() {
  // Add a check at the beginning of the component to ensure authentication is properly handled
  // Add this near the top of the component:

  useEffect(() => {
    // Check if we're in development mode with dev admin access
    const devModeAdminAccess = localStorage.getItem("devModeAdminAccess")
    if (process.env.NODE_ENV === "development" && devModeAdminAccess === "true") {
      console.log("Dev mode admin access detected in individual page")
      // No need to redirect, just log for debugging
    }
  }, [])

  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [stats, setStats] = useState<SiteStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    satisfactionRate: 0,
  })

  const { db } = useFirebase()
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      if (!db) return

      try {
        // Загрузка статистики
        const siteStats = await getSiteStats()
        setStats(siteStats)

        // Загрузка курсов
        const coursesRef = ref(db, "courses")
        const snapshot = await get(coursesRef)

        if (snapshot.exists()) {
          const coursesData = snapshot.val() as Record<string, Course>
          const individualCourses = Object.values(coursesData)
            .filter((course) => course.type === "individual")
            .sort((a, b) => b.createdAt - a.createdAt)

          setCourses(individualCourses)
          setFilteredCourses(individualCourses)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Алдаа",
          description: "Мэдээлэл ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [db, toast])

  useEffect(() => {
    // Filter courses based on search query and category
    let filtered = courses

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (course) => course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((course) => course.category === selectedCategory)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, selectedCategory, courses])

  const handleAddToCart = (course: Course) => {
    addToCart({
      id: course.id,
      title: course.title,
      price: course.price,
      type: course.type,
      category: course.category,
    })

    toast({
      title: "Амжилттай",
      description: "Хичээл сагсанд нэмэгдлээ",
    })
  }

  // Get unique categories
  const categories = Array.from(new Set(courses.map((course) => course.category)))

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  const renderStars = (rating = 4.5) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : i < rating
                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                  : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-400">{rating.toFixed(1)}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-teal-400 animate-pulse">Ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-black min-h-screen text-white">
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-600">
            Хувь хүний маркетинг
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Хувь хүний брэнд, нийгмийн сүлжээний хөгжүүлэлт, контент бүтээх хичээлүүд
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 -mt-16 relative z-20 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg opacity-80 blur-md group-hover:opacity-100 transition-all duration-300"></div>
            <Card className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl font-bold text-white">{stats.totalCourses}+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Хичээлийн тоо</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-80 blur-md group-hover:opacity-100 transition-all duration-300"></div>
            <Card className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl font-bold text-white">{stats.totalStudents}+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Суралцагчид</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-80 blur-md group-hover:opacity-100 transition-all duration-300"></div>
            <Card className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl font-bold text-white">{stats.totalInstructors}+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Мэргэжилтнүүд</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg opacity-80 blur-md group-hover:opacity-100 transition-all duration-300"></div>
            <Card className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl font-bold text-white">{stats.satisfactionRate}%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Сэтгэл ханамж</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-lg overflow-hidden mb-16"
        >
          <div className="bg-gradient-to-r from-teal-900 to-cyan-900 p-8 md:p-12 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
            <div className="absolute inset-0 bg-[url('/abstract-digital-pattern.png')] opacity-10 mix-blend-overlay"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]">
                  Хувь хүний онлайн оршихуйг хөгжүүлэх
                </h2>
                <p className="text-teal-200 mb-6">
                  Нийгмийн сүлжээнд өөрийн брэндийг бий болгох, чанартай контент бүтээх, дагагчдын тоог нэмэгдүүлэх,
                  орлого олох бүх төрлийн хичээлүүдийг санал болгож байна.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.8)]"
                  >
                    Дэлгэрэнгүй
                  </Button>
                  <Button
                    variant="outline"
                    className="border-teal-500 text-teal-400 hover:bg-teal-900/30 hover:text-teal-300 transition-all duration-300"
                    size="lg"
                  >
                    Хичээлүүд үзэх
                  </Button>
                </div>
              </motion.div>
              <motion.div
                className="hidden md:block"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg blur-lg opacity-75 animate-pulse"></div>
                  <img
                    src="/abstract-geometric-shapes.png"
                    alt="Хувь хүний маркетинг"
                    className="rounded-lg shadow-2xl relative z-10 w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-gradient-to-br from-teal-900/40 to-black shadow-[0_0_15px_rgba(20,184,166,0.3)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-all duration-300 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-teal-400 mb-2" />
                <CardTitle className="text-white">Хувь хүний брэнд</CardTitle>
                <CardDescription className="text-teal-300">
                  Өөрийн онцлог, давуу талаа тодорхойлж, хүчтэй хувь хүний брэнд бий болгох
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-gradient-to-br from-cyan-900/40 to-black shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-cyan-600 to-blue-600"></div>
              <CardHeader>
                <Award className="h-8 w-8 text-cyan-400 mb-2" />
                <CardTitle className="text-white">Дагагчдын тоо нэмэгдүүлэх</CardTitle>
                <CardDescription className="text-cyan-300">
                  Нийгмийн сүлжээний хүрээг тэлэх, идэвхжүүлэх, хөрвүүлэлтийг нэмэгдүүлэх
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-gradient-to-br from-blue-900/40 to-black shadow-[0_0_15px_rgba(37,99,235,0.3)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Орлого олох</CardTitle>
                <CardDescription className="text-blue-300">
                  Контентоос орлого олох, хамтын ажиллагаа, бүтээгдэхүүн борлуулах
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>

        {/* Search and filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border border-teal-500/20 bg-black/40 backdrop-blur-sm shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-md blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-black rounded-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-teal-400" />
                    <Input
                      type="search"
                      placeholder="Хичээл хайх..."
                      className="pl-9 bg-transparent border-teal-500/30 focus:border-teal-500 text-white placeholder:text-teal-300/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid" ? "bg-teal-600 hover:bg-teal-700" : "border-teal-500/50 text-teal-400"
                    }
                    size="icon"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list" ? "bg-teal-600 hover:bg-teal-700" : "border-teal-500/50 text-teal-400"
                    }
                    size="icon"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="text-teal-400 hover:text-teal-300 hover:bg-teal-900/30 w-full flex justify-between items-center"
              >
                <span>Шүүлтүүр</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-teal-500/20"
                >
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      onClick={() => setSelectedCategory(null)}
                      className={
                        selectedCategory === null
                          ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                          : "border-teal-500/50 text-teal-400 hover:bg-teal-900/30"
                      }
                    >
                      Бүгд
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category)}
                        className={
                          selectedCategory === category
                            ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                            : "border-teal-500/50 text-teal-400 hover:bg-teal-900/30"
                        }
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <Tabs defaultValue="all" className="mb-12">
            <TabsList className="bg-black/60 border border-teal-500/30 p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                Бүх хичээлүүд
              </TabsTrigger>
              <TabsTrigger
                value="popular"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                Эрэлттэй
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                Шинэ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 border border-teal-500/20 rounded-md bg-black/40">
                  <p className="text-teal-300">Хичээл олдсонгүй</p>
                </div>
              ) : viewMode === "grid" ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredCourses.map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
                      <Card className="group border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden h-full flex flex-col">
                        <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>

                        <div className="relative">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={`/abstract-geometric-shapes.png`}
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 border-0 shadow-lg">
                              {course.price.toLocaleString()}₮
                            </Badge>
                          </div>
                        </div>

                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-white group-hover:text-teal-300 transition-colors duration-300">
                                {course.title}
                              </CardTitle>
                              <CardDescription className="mt-2 text-teal-300">{course.category}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="flex-grow">
                          <p className="text-gray-400 line-clamp-3">{course.description}</p>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-teal-400" />
                              <span className="text-sm text-teal-300">{course.lessons.length} хичээл</span>
                            </div>

                            {course.viewCount !== undefined && (
                              <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-teal-400" />
                                <span className="text-sm text-teal-300">{course.viewCount} үзсэн</span>
                              </div>
                            )}

                            <div className="pt-1">{renderStars(4.5)}</div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-4 flex gap-4">
                          <Button
                            asChild
                            variant="outline"
                            className="flex-1 border-teal-500/50 text-teal-400 hover:bg-teal-900/30 hover:text-teal-300"
                          >
                            <a href={`/courses/${course.id}`}>Дэлгэрэнгүй</a>
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(course)}
                            className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-0"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Сагсанд
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {filteredCourses.map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
                      <Card className="group border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
                        <div className="flex flex-col md:flex-row">
                          <div className="relative md:w-1/4">
                            <div className="h-48 md:h-full overflow-hidden">
                              <img
                                src={`/abstract-geometric-shapes.png`}
                                alt={course.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 border-0 shadow-lg">
                                {course.price.toLocaleString()}₮
                              </Badge>
                            </div>
                          </div>

                          <div className="flex-1 p-6">
                            <div className="mb-4">
                              <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors duration-300">
                                {course.title}
                              </h3>
                              <p className="text-teal-300 text-sm">{course.category}</p>
                              <div className="mt-1">{renderStars(4.5)}</div>
                            </div>

                            <p className="text-gray-400 line-clamp-2 mb-4">{course.description}</p>

                            <div className="flex flex-wrap gap-4 items-center">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-teal-400" />
                                <span className="text-sm text-teal-300">{course.lessons.length} хичээл</span>
                              </div>

                              {course.viewCount !== undefined && (
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-teal-400" />
                                  <span className="text-sm text-teal-300">{course.viewCount} үзсэн</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex gap-4">
                              <Button
                                asChild
                                variant="outline"
                                className="border-teal-500/50 text-teal-400 hover:bg-teal-900/30 hover:text-teal-300"
                              >
                                <a href={`/courses/${course.id}`}>Дэлгэрэнгүй</a>
                              </Button>
                              <Button
                                onClick={() => handleAddToCart(course)}
                                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-0"
                              >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Сагсанд
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="popular" className="mt-6">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 border border-teal-500/20 rounded-md bg-black/40">
                  <p className="text-teal-300">Хичээл олдсонгүй</p>
                </div>
              ) : viewMode === "grid" ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredCourses
                    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                    .slice(0, 6)
                    .map((course) => (
                      <motion.div key={course.id} variants={itemVariants}>
                        <Card className="group border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden h-full flex flex-col">
                          <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>

                          <div className="relative">
                            <div className="h-48 overflow-hidden">
                              <img
                                src={`/abstract-geometric-shapes.png`}
                                alt={course.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 border-0 shadow-lg">
                                {course.price.toLocaleString()}₮
                              </Badge>
                            </div>
                          </div>

                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-white group-hover:text-teal-300 transition-colors duration-300">
                                  {course.title}
                                </CardTitle>
                                <CardDescription className="mt-2 text-teal-300">{course.category}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="flex-grow">
                            <p className="text-gray-400 line-clamp-3">{course.description}</p>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-teal-400" />
                                <span className="text-sm text-teal-300">{course.lessons.length} хичээл</span>
                              </div>

                              {course.viewCount !== undefined && (
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-teal-400" />
                                  <span className="text-sm text-teal-300">{course.viewCount} үзсэн</span>
                                </div>
                              )}

                              <div className="pt-1">{renderStars(4.5)}</div>
                            </div>
                          </CardContent>

                          <CardFooter className="pt-4 flex gap-4">
                            <Button
                              asChild
                              variant="outline"
                              className="flex-1 border-teal-500/50 text-teal-400 hover:bg-teal-900/30 hover:text-teal-300"
                            >
                              <a href={`/courses/${course.id}`}>Дэлгэрэнгүй</a>
                            </Button>
                            <Button
                              onClick={() => handleAddToCart(course)}
                              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-0"
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Сагсанд
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {filteredCourses
                    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                    .slice(0, 6)
                    .map((course) => (
                      <motion.div key={course.id} variants={itemVariants}>
                        <Card className="group border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden">
                          <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
                          <div className="flex flex-col md:flex-row">
                            <div className="relative md:w-1/4">
                              <div className="h-48 md:h-full overflow-hidden">
                                <img
                                  src={`/abstract-geometric-shapes.png`}
                                  alt={course.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 border-0 shadow-lg">
                                  {course.price.toLocaleString()}₮
                                </Badge>
                              </div>
                            </div>

                            <div className="flex-1 p-6">
                              <div className="mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors duration-300">
                                  {course.title}
                                </h3>
                                <p className="text-teal-300 text-sm">{course.category}</p>
                                <div className="mt-1">{renderStars(4.5)}</div>
                              </div>

                              <p className="text-gray-400 line-clamp-2 mb-4">{course.description}</p>

                              <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-teal-400" />
                                  <span className="text-sm text-teal-300">{course.lessons.length} хичээл</span>
                                </div>

                                {course.viewCount !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-teal-400" />
                                    <span className="text-sm text-teal-300">{course.viewCount} үзсэн</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex gap-4">
                                <Button
                                  asChild
                                  variant="outline"
                                  className="border-teal-500/50 text-teal-400 hover:bg-teal-900/30 hover:text-teal-300"
                                >
                                  <a href={`/courses/${course.id}`}>Дэлгэрэнгүй</a>
                                </Button>
                                <Button
                                  onClick={() => handleAddToCart(course)}
                                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-0"
                                >
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Сагсанд
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-6">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 border border-teal-500/20 rounded-md bg-black/40">
                  <p className="text-teal-300">Хичээл олдсонгүй</p>
                </div>
              ) : viewMode === "grid" ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredCourses
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 6)
                    .map((course) => (
                      <motion.div key={course.id} variants={itemVariants}>
                        <Card className="group border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden h-full flex flex-col">
                          <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>

                          <div className="relative">
                            <div className="h-48 overflow-hidden">
                              <img
                                src={`/abstract-geometric-shapes.png`}
                                alt={course.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 border-0 shadow-lg">
                                {course.price.toLocaleString()}₮
                              </Badge>
                            </div>
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-lg">
                                Шинэ
                              </Badge>
                            </div>
                          </div>

                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-white group-hover:text-teal-300 transition-colors duration-300">
                                  {course.title}
                                </CardTitle>
                                <CardDescription className="mt-2 text-teal-300">{course.category}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="flex-grow">
                            <p className="text-gray-400 line-clamp-3">{course.description}</p>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-teal-400" />
                                <span className="text-sm text-teal-300">{course.lessons.length} хичээл</span>
                              </div>

                              {course.viewCount !== undefined && (
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-teal-400" />
                                  <span className="text-sm text-teal-300">{course.viewCount} үзсэн</span>
                                </div>
                              )}

                              <div className="pt-1">{renderStars(4.5)}</div>
                            </div>
                          </CardContent>

                          <CardFooter className="pt-4 flex gap-4">
                            <Button
                              asChild
                              variant="outline"
                              className="flex-1 border-teal-500/50 text-teal-400 hover:bg-teal-900/30 hover:text-teal-300"
                            >
                              <a href={`/courses/${course.id}`}>Дэлгэрэнгүй</a>
                            </Button>
                            <Button
                              onClick={() => handleAddToCart(course)}
                              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-0"
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Сагсанд
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {filteredCourses
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 6)
                    .map((course) => (
                      <motion.div key={course.id} variants={itemVariants}>
                        <Card className="group border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden">
                          <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
                          <div className="flex flex-col md:flex-row">
                            <div className="relative md:w-1/4">
                              <div className="h-48 md:h-full overflow-hidden">
                                <img
                                  src={`/abstract-geometric-shapes.png`}
                                  alt={course.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 border-0 shadow-lg">
                                  {course.price.toLocaleString()}₮
                                </Badge>
                              </div>
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-lg">
                                  Шинэ
                                </Badge>
                              </div>
                            </div>

                            <div className="flex-1 p-6">
                              <div className="mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors duration-300">
                                  {course.title}
                                </h3>
                                <p className="text-teal-300 text-sm">{course.category}</p>
                                <div className="mt-1">{renderStars(4.5)}</div>
                              </div>

                              <p className="text-gray-400 line-clamp-2 mb-4">{course.description}</p>

                              <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-teal-400" />
                                  <span className="text-sm text-teal-300">{course.lessons.length} хичээл</span>
                                </div>

                                {course.viewCount !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-teal-400" />
                                    <span className="text-sm text-teal-300">{course.viewCount} үзсэн</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex gap-4">
                                <Button
                                  asChild
                                  variant="outline"
                                  className="border-teal-500/50 text-teal-400 hover:bg-teal-900/30 hover:text-teal-300"
                                >
                                  <a href={`/courses/${course.id}`}>Дэлгэрэнгүй</a>
                                </Button>
                                <Button
                                  onClick={() => handleAddToCart(course)}
                                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-0"
                                >
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Сагсанд
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-600">
            Түгээмэл асуултууд
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
              <CardHeader>
                <CardTitle className="text-white">Хувь хүний хичээлүүд хэнд зориулагдсан бэ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Хувь хүний хичээлүүд нь нийгмийн сүлжээнд идэвхтэй байдаг, өөрийн брэндийг хөгжүүлэхийг хүсдэг,
                  контент үүсгэгч болохыг хүсэж буй хүмүүст зориулагдсан. Мөн инфлюэнсер, блогер, ютүбер, подкастер
                  болон бусад онлайн контент үүсгэгчид энэхүү хичээлүүдээс үр өгөөжийг хүртэх боломжтой.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
              <CardHeader>
                <CardTitle className="text-white">Хичээлүүдийг хэрхэн үзэх вэ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Хичээлүүдийг худалдан авсны дараа таны бүртгэлтэй хаягаар нэвтрэн орж үзэх боломжтой. Хичээлүүд нь
                  видео, текст, зураг гэх мэт олон төрлийн контенттой бөгөөд та өөрийн тохиромжтой цагт, хурдаар
                  суралцах боломжтой.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
              <CardHeader>
                <CardTitle className="text-white">Хичээлүүд хэр үр дүнтэй вэ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Манай хичээлүүд нь практик туршлага дээр суурилсан бөгөөд олон амжилттай инфлюэнсер, контент
                  үүсгэгчдийн туршлагыг багтаасан. Хичээлийн дагуу алхам алхмаар дагаж хийснээр дагагчдын тоо
                  нэмэгдүүлэх, контентын чанарыг сайжруулах, орлого олох боломжтой.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-teal-900/30 to-black shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-sm hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all duration-300 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
              <CardHeader>
                <CardTitle className="text-white">
                  Ямар төрлийн нийгмийн сүлжээнд зориулсан хичээлүүд байдаг вэ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Бид Instagram, TikTok, YouTube, Facebook, LinkedIn, Twitter зэрэг бүх төрлийн нийгмийн сүлжээнд
                  зориулсан хичээлүүдтэй. Мөн подкаст, блог, вэбсайт зэрэг бусад онлайн платформуудад зориулсан
                  хичээлүүд бас байгаа.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 relative overflow-hidden rounded-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-cyan-900 opacity-80"></div>
          <div className="absolute inset-0 bg-[url('/abstract-digital-pattern.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]">
              Өөрийн онлайн оршихуйг хөгжүүлэхэд бэлэн үү?
            </h2>
            <p className="text-teal-200 mb-6 max-w-2xl mx-auto">
              Манай мэргэжлийн багш нар таны онцлогт тохирсон контент үүсгэх, дагагчдын тоог нэмэгдүүлэх, орлого олох
              арга замуудыг заах болно.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.8)]"
              >
                Хичээлүүд үзэх
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-teal-400 text-teal-200 hover:bg-teal-900/30 hover:text-teal-100 transition-all duration-300"
              >
                Холбоо барих
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

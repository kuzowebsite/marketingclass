"use client"

import { useEffect, useState } from "react"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { useCart } from "@/lib/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Course, CourseLevel } from "@/lib/types"
import { getSiteStats, type SiteStats } from "@/lib/stats-service"
import {
  ShoppingCart,
  Users,
  BookOpen,
  Filter,
  Clock,
  LayoutGrid,
  List,
  Search,
  Star,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Zap,
  Award,
  BarChart,
} from "lucide-react"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { MobileCourseCard } from "@/components/mobile-course-card"
import { MobileFilterBar } from "@/components/mobile-filter-bar"
import { CourseTabsPreset } from "@/components/mobile-tabs"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState<SiteStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCategories: 0,
  })

  const { db } = useFirebase()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const { isMobile } = useMobile()

  // Хичээлүүдийг татах
  useEffect(() => {
    const fetchCourses = async () => {
      if (!db) return

      try {
        const coursesRef = ref(db, "courses")
        const snapshot = await get(coursesRef)

        if (snapshot.exists()) {
          const coursesData = snapshot.val() as Record<string, Course>
          const allCourses = Object.values(coursesData).sort((a, b) => b.createdAt - a.createdAt)
          setCourses(allCourses)
          setFilteredCourses(allCourses)
        }
      } catch (error) {
        console.error("Хичээлүүд татахад алдаа гарлаа:", error)
        toast({
          title: "Алдаа",
          description: "Хичээлүүд ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [db, toast])

  // Статистик мэдээлэл татах
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const siteStats = await getSiteStats()
        setStats(siteStats)
      } catch (error) {
        console.error("Статистик мэдээлэл татахад алдаа гарлаа:", error)
      }
    }

    fetchStats()
  }, [])

  // Хайлт болон шүүлтүүрийг хэрэгжүүлэх
  useEffect(() => {
    // Хайлт болон шүүлтүүрээр хичээлүүдийг шүүх
    let filtered = courses

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          (course.tags && course.tags.some((tag) => tag.toLowerCase().includes(query))),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((course) => course.category === selectedCategory)
    }

    if (selectedType) {
      filtered = filtered.filter((course) => course.type === selectedType)
    }

    if (selectedLevel) {
      filtered = filtered.filter((course) => course.level === selectedLevel)
    }

    // Таб-аар шүүх
    if (activeTab !== "all") {
      if (activeTab === "popular") {
        filtered = [...filtered].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      } else if (activeTab === "new") {
        filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt)
      } else if (activeTab === "featured") {
        filtered = filtered.filter((course) => course.featured)
      }
    }

    setFilteredCourses(filtered)
  }, [searchQuery, selectedCategory, selectedType, selectedLevel, courses, activeTab])

  // Сагсанд нэмэх функц
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

  // Шүүлтүүр өөрчлөх
  const handleFilterChange = (type: string, value: string | null) => {
    switch (type) {
      case "category":
        setSelectedCategory(value)
        break
      case "level":
        setSelectedLevel(value as CourseLevel | null)
        break
      case "type":
        setSelectedType(value)
        break
    }
  }

  // Хайлт өөрчлөх
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  // Таб өөрчлөх
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  // Ангилал, төрөл, түвшингүүдийг олох
  const categories = Array.from(new Set(courses.map((course) => course.category))).map((category) => ({
    id: category,
    name: category,
  }))

  const types = [
    { id: "organization", name: "Байгууллагын" },
    { id: "individual", name: "Хувь хүний" },
  ]

  const levels = [
    { id: "beginner", name: "Анхан шат" },
    { id: "intermediate", name: "Дунд шат" },
    { id: "advanced", name: "Гүнзгий" },
  ]

  // Ачаалж байх үеийн харагдац
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

  // Мобайл харагдац
  if (isMobile) {
    return (
      <div className="pb-16 bg-gray-900 min-h-screen">
        {/* Хайлтын хэсэг */}
        <div className="sticky top-[57px] z-40 bg-gray-900 border-b border-gray-800 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Хичээл хайх..."
              className="pl-9 bg-gray-800 border-gray-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Шүүлтүүр */}
        <MobileFilterBar
          categories={categories}
          levels={levels}
          types={types}
          onFilterChange={handleFilterChange}
          selectedCategory={selectedCategory}
          selectedLevel={selectedLevel}
          selectedType={selectedType}
          totalItems={filteredCourses.length}
        />

        {/* Tabs */}
        <div className="px-4 pt-4">
          <CourseTabsPreset onChange={handleTabChange} />

          <div className="mt-4">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 border border-gray-800 rounded-lg bg-gray-800/30">
                <p className="text-gray-400">Хичээл олдсонгүй</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredCourses.map((course, index) => (
                  <MobileCourseCard key={course.id} course={course} onAddToCart={handleAddToCart} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Түвшингийн хэсэг */}
        <div className="px-4 py-8">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Түвшингээр сонгох</h2>

          <div className="space-y-3">
            <Button
              onClick={() => setSelectedLevel("beginner")}
              className="w-full justify-between bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white h-12"
            >
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Анхан шат
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => setSelectedLevel("intermediate")}
              className="w-full justify-between bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white h-12"
            >
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                Дунд шат
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => setSelectedLevel("advanced")}
              className="w-full justify-between bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white h-12"
            >
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Гүнзгий
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Desktop харагдац (оригинал код)
  // Анимацийн вариантууд
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

  // Категорийн өнгөний кодууд
  const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
    default: { bg: "bg-primary/10", text: "text-primary", icon: "text-primary" },
    "Дижитал маркетинг": { bg: "bg-teal-100", text: "text-teal-700", icon: "text-teal-500" },
    "Сошиал медиа": { bg: "bg-blue-100", text: "text-blue-700", icon: "text-blue-500" },
    "Контент маркетинг": { bg: "bg-amber-100", text: "text-amber-700", icon: "text-amber-500" },
    "Имэйл маркетинг": { bg: "bg-emerald-100", text: "text-emerald-700", icon: "text-emerald-500" },
    "Хайлтын системийн оновчлол": { bg: "bg-indigo-100", text: "text-indigo-700", icon: "text-indigo-500" },
    "Брэнд менежмент": { bg: "bg-rose-100", text: "text-rose-700", icon: "text-rose-500" },
    "Маркетингийн стратеги": { bg: "bg-violet-100", text: "text-violet-700", icon: "text-violet-500" },
    "Хэрэглэгчийн туршлага": { bg: "bg-cyan-100", text: "text-cyan-700", icon: "text-cyan-500" },
  }

  // Категорийн өнгө авах функц
  const getCategoryColor = (category: string) => {
    return categoryColors[category] || categoryColors.default
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950">
      {/* Толгой хэсэг - Шинэчилсэн дизайн */}
      <div className="relative bg-gradient-to-r from-primary/90 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/abstract-geometric-flow.png')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="container py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              Маркетингийн бүх төрлийн хичээлүүд
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed"
            >
              Байгууллагын болон хувь хүний маркетингийн чиглэлээр мэргэжлийн багш нараас суралцаарай
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative max-w-2xl mx-auto"
            >
              <Search className="absolute left-3 top-3 h-5 w-5 text-white/70" />
              <Input
                type="search"
                placeholder="Хичээл хайх..."
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Статистик мэдээлэл - Шинэчилсэн дизайн */}
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
                <p className="text-gray-300">Нийт хичээлүүд</p>
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
                <p className="text-gray-300">Багш нар</p>
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
                <CardTitle className="text-4xl font-bold text-white">{stats.totalCategories}+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">Ангилалууд</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Шүүлтүүр хэсэг - Шинэчилсэн дизайн */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg border border-gray-800 mb-8"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center text-white">
                <Filter className="h-5 w-5 mr-2 text-teal-400" />
                Хичээлүүд ({filteredCourses.length})
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-teal-400/30 text-teal-400 hover:bg-teal-400/10 bg-transparent"
              >
                <Filter className="h-4 w-4" />
                Шүүлтүүр {showFilters ? "Хаах" : "Харах"}
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800"
              >
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-300">Төрөл</label>
                  <Select value={selectedType || ""} onValueChange={(value) => setSelectedType(value || null)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Бүх төрөл" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all">Бүх төрөл</SelectItem>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-300">Ангилал</label>
                  <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Бүх ангилал" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all">Бүх ангилал</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-300">Түвшин</label>
                  <Select
                    value={selectedLevel || ""}
                    onValueChange={(value) => setSelectedLevel((value as CourseLevel) || null)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Бүх түвшин" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all">Бүх түвшин</SelectItem>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Харах горим сонголт */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2 bg-gray-900/80 backdrop-blur-sm p-1 rounded-lg border border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("grid")}
              className={view === "grid" ? "bg-teal-400/20 text-teal-400" : "text-gray-400 hover:text-white"}
            >
              <LayoutGrid className="h-4 w-4 mr-1" /> Хүснэгт
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("list")}
              className={view === "list" ? "bg-teal-400/20 text-teal-400" : "text-gray-400 hover:text-white"}
            >
              <List className="h-4 w-4 mr-1" /> Жагсаалт
            </Button>
          </div>
        </div>

        {/* Хичээлүүд - Шинэчилсэн дизайн */}
        <Tabs defaultValue="all" className="mb-12">
          <TabsList className="mb-6 bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-teal-400 data-[state=active]:text-gray-900 text-gray-300"
            >
              <BookOpen className="h-4 w-4 mr-2" /> Бүх хичээлүүд
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="data-[state=active]:bg-teal-400 data-[state=active]:text-gray-900 text-gray-300"
            >
              <TrendingUp className="h-4 w-4 mr-2" /> Эрэлттэй
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="data-[state=active]:bg-teal-400 data-[state=active]:text-gray-900 text-gray-300"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Шинэ
            </TabsTrigger>
            <TabsTrigger
              value="featured"
              className="data-[state=active]:bg-teal-400 data-[state=active]:text-gray-900 text-gray-300"
            >
              <Star className="h-4 w-4 mr-2" /> Онцлох
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-gray-900/80 backdrop-blur-sm border-gray-800">
                <p className="text-gray-400">Хичээл олдсонгүй</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={
                  view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-4"
                }
              >
                {filteredCourses.map((course) => (
                  <motion.div key={course.id} variants={itemVariants}>
                    {view === "grid" ? (
                      <CourseCard
                        course={course}
                        onAddToCart={handleAddToCart}
                        categoryColors={getCategoryColor(course.category)}
                      />
                    ) : (
                      <CourseListItem
                        course={course}
                        onAddToCart={handleAddToCart}
                        categoryColors={getCategoryColor(course.category)}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="popular">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-gray-900/80 backdrop-blur-sm border-gray-800">
                <p className="text-gray-400">Хичээл олдсонгүй</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={
                  view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-4"
                }
              >
                {filteredCourses
                  .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                  .slice(0, 9)
                  .map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
                      {view === "grid" ? (
                        <CourseCard
                          course={course}
                          onAddToCart={handleAddToCart}
                          categoryColors={getCategoryColor(course.category)}
                        />
                      ) : (
                        <CourseListItem
                          course={course}
                          onAddToCart={handleAddToCart}
                          categoryColors={getCategoryColor(course.category)}
                        />
                      )}
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="new">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-gray-900/80 backdrop-blur-sm border-gray-800">
                <p className="text-gray-400">Хичээл олдсонгүй</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={
                  view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-4"
                }
              >
                {filteredCourses
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .slice(0, 9)
                  .map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
                      {view === "grid" ? (
                        <CourseCard
                          course={course}
                          onAddToCart={handleAddToCart}
                          categoryColors={getCategoryColor(course.category)}
                        />
                      ) : (
                        <CourseListItem
                          course={course}
                          onAddToCart={handleAddToCart}
                          categoryColors={getCategoryColor(course.category)}
                        />
                      )}
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Түвшингийн хэсэг - Шинэчилсэн дизайн */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Түвшингээр сонгох</h2>
            <p className="text-gray-400 mt-2">Өөрийн мэдлэгийн түвшинд тохирсон хичээлүүдийг сонгоорой</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg opacity-80 blur-md group-hover:opacity-100 transition-all duration-300"></div>
              <div className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden rounded-lg p-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-500"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-gray-800 rounded-full p-3 text-teal-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">Анхан шат</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Маркетингийн үндсэн ойлголтууд, анхан шатны мэдлэг олгох хичээлүүд
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedLevel("beginner")}
                  className="w-full mt-2 bg-transparent border border-teal-400 text-teal-400 hover:bg-teal-400/10 group-hover:bg-teal-400/10 transition-all"
                >
                  Хичээлүүд үзэх <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg opacity-80 blur-md group-hover:opacity-100 transition-all duration-300"></div>
              <div className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden rounded-lg p-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-gray-800 rounded-full p-3 text-blue-400">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">Дунд шат</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Маркетингийн арга хэрэгслүүдийг гүнзгийрүүлэн судлах хичээлүүд
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedLevel("intermediate")}
                  className="w-full mt-2 bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400/10 group-hover:bg-blue-400/10 transition-all"
                >
                  Хичээлүүд үзэх <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg opacity-80 blur-md group-hover:opacity-100 transition-all duration-300"></div>
              <div className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden rounded-lg p-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <div className="flex items-start gap-4">
                  <div className="bg-gray-800 rounded-full p-3 text-purple-400">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">Гүнзгий</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Мэргэжлийн түвшинд маркетингийн стратеги, аналитик судлах хичээлүүд
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedLevel("advanced")}
                  className="w-full mt-2 bg-transparent border border-purple-400 text-purple-400 hover:bg-purple-400/10 group-hover:bg-purple-400/10 transition-all"
                >
                  Хичээлүүд үзэх <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA хэсэг - Шинэчилсэн дизайн */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl opacity-80 blur-md group-hover:opacity-100 transition-all duration-300"></div>
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-8 md:p-12 text-center text-white overflow-hidden relative z-10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Маркетингийн мэдлэгээ дээшлүүлэхэд бэлэн үү?</h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto text-gray-300">
                Манай мэргэжлийн багш нар таны хэрэгцээ, сонирхолд тохирсон хичээлүүдийг санал болгож, мэргэжлийн
                түвшинд хүрэхэд тань туслах болно.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-teal-400 text-gray-900 hover:bg-teal-500">
                  Эхлэх хичээлүүд
                </Button>
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                  Зөвлөгөө авах
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Хичээлийн карт компонент - Шинэчилсэн дизайн
function CourseCard({
  course,
  onAddToCart,
  categoryColors,
}: {
  course: Course
  onAddToCart: (course: Course) => void
  categoryColors: { bg: string; text: string; icon: string }
}) {
  // Хичээлийн түвшинг монгол хэлээр харуулах
  const getLevelText = (level?: CourseLevel) => {
    switch (level) {
      case "beginner":
        return "Анхан шат"
      case "intermediate":
        return "Дунд шат"
      case "advanced":
        return "Гүнзгий"
      default:
        return "Бүх түвшин"
    }
  }

  // Хичээлийн төрлийг монгол хэлээр харуулах
  const getTypeText = (type: string) => {
    return type === "organization" ? "Байгууллагын" : "Хувь хүний"
  }

  // Үнийн хөнгөлөлт тооцох
  const discountedPrice = course.discount
    ? Math.round(course.price - (course.price * course.discount) / 100)
    : course.price

  // Үнэлгээний одны тоо (жишээ)
  const rating = course.rating || 4.5

  // Түвшингийн өнгө
  const getLevelColor = (level?: CourseLevel) => {
    switch (level) {
      case "beginner":
        return "bg-teal-400/20 text-teal-400"
      case "intermediate":
        return "bg-blue-400/20 text-blue-400"
      case "advanced":
        return "bg-purple-400/20 text-purple-400"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400/50 to-blue-500/50 rounded-lg opacity-0 blur-md group-hover:opacity-100 transition-all duration-300"></div>
      <Card className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden flex flex-col h-full">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
        <div className="h-48 bg-gray-800 relative overflow-hidden">
          <img
            src={`/generic-placeholder-graphic.png?key=${course.id}&height=200&width=400&query=marketing%20course%20${course.category}`}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
          />
          {course.featured && (
            <Badge className="absolute top-3 left-3 bg-amber-500 z-10">
              <Star className="h-3 w-3 mr-1 fill-current" /> Онцлох
            </Badge>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {course.discount ? (
              <>
                <Badge className="bg-red-500 animate-pulse">{course.discount}% хямдрал</Badge>
                <div className="flex flex-col items-end">
                  <span className="text-xs line-through bg-black/70 text-white px-2 py-0.5 rounded">
                    {course.price.toLocaleString()}₮
                  </span>
                  <Badge className="bg-teal-400 text-gray-900 mt-1 font-bold">
                    {discountedPrice.toLocaleString()}₮
                  </Badge>
                </div>
              </>
            ) : (
              <Badge className="bg-teal-400 text-gray-900 font-bold">{course.price.toLocaleString()}₮</Badge>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
        </div>
        <CardHeader className="pb-2 relative overflow-hidden">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="line-clamp-2 text-white group-hover:text-teal-400 transition-colors">
              {course.title}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="border-teal-400/30 text-teal-400 text-xs">
              {course.category}
            </Badge>
            <Badge variant="outline" className="border-gray-700 bg-gray-800 text-gray-300 text-xs">
              {getTypeText(course.type)}
            </Badge>
            {course.level && (
              <Badge variant="outline" className={`${getLevelColor(course.level)} text-xs border-0`}>
                {getLevelText(course.level)}
              </Badge>
            )}
          </div>
          {/* Үнэлгээ */}
          <div className="flex items-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-400">{rating.toFixed(1)}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-gray-400 line-clamp-3 mb-4 text-sm">{course.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-400">{course.lessons?.length || 0} хичээл</span>
            </div>
            {course.totalDuration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">{course.totalDuration} мин</span>
              </div>
            )}
          </div>
          {course.instructor && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
              <div className="h-8 w-8 rounded-full bg-gray-800 overflow-hidden">
                {course.instructor.avatar ? (
                  <img
                    src={course.instructor.avatar || "/placeholder.svg"}
                    alt={course.instructor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-400/10 text-teal-400 font-medium">
                    {course.instructor.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-300">{course.instructor.name}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3 border-t border-gray-800 pt-4 bg-gray-900/50">
          <Button
            asChild
            variant="outline"
            className="flex-1 bg-transparent border-teal-400/30 text-teal-400 hover:bg-teal-400/10"
          >
            <a href={`/courses/${course.id}`}>Дэлгэрэнгүй</a>
          </Button>
          <Button onClick={() => onAddToCart(course)} className="flex-1 bg-teal-400 text-gray-900 hover:bg-teal-500">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Сагсанд
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Жагсаалт харагдацтай хичээлийн компонент
function CourseListItem({
  course,
  onAddToCart,
  categoryColors,
}: {
  course: Course
  onAddToCart: (course: Course) => void
  categoryColors: { bg: string; text: string; icon: string }
}) {
  // Хичээлийн түвшинг монгол хэлээр харуулах
  const getLevelText = (level?: CourseLevel) => {
    switch (level) {
      case "beginner":
        return "Анхан шат"
      case "intermediate":
        return "Дунд шат"
      case "advanced":
        return "Гүнзгий"
      default:
        return "Бүх түвшин"
    }
  }

  // Хичээлийн төрлийг монгол хэлээр харуулах
  const getTypeText = (type: string) => {
    return type === "organization" ? "Байгууллагын" : "Хувь хүний"
  }

  // Үнийн хөнгөлөлт тооцох
  const discountedPrice = course.discount
    ? Math.round(course.price - (course.price * course.discount) / 100)
    : course.price

  // Үнэлгээний одны тоо (жишээ)
  const rating = course.rating || 4.5

  // Түвшингийн өнгө
  const getLevelColor = (level?: CourseLevel) => {
    switch (level) {
      case "beginner":
        return "bg-teal-400/20 text-teal-400"
      case "intermediate":
        return "bg-blue-400/20 text-blue-400"
      case "advanced":
        return "bg-purple-400/20 text-purple-400"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400/50 to-blue-500/50 rounded-lg opacity-0 blur-md group-hover:opacity-100 transition-all duration-300"></div>
      <Card className="bg-gray-900/90 backdrop-blur-sm border-0 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 h-48 md:h-auto bg-gray-800 relative overflow-hidden">
            <img
              src={`/generic-placeholder-graphic.png?key=${course.id}&height=200&width=400&query=marketing%20course%20${course.category}`}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
            />
            {course.featured && (
              <Badge className="absolute top-3 left-3 bg-amber-500 z-10">
                <Star className="h-3 w-3 mr-1 fill-current" /> Онцлох
              </Badge>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
          </div>

          <div className="md:w-3/4 flex flex-col relative">
            <div className="p-4 pl-6">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                  {course.title}
                </h3>
                <div>
                  {course.discount ? (
                    <div className="flex flex-col items-end">
                      <Badge className="bg-red-500 mb-1">{course.discount}% хямдрал</Badge>
                      <span className="text-xs line-through text-gray-500">{course.price.toLocaleString()}₮</span>
                      <Badge className="bg-teal-400 text-gray-900 font-bold">{discountedPrice.toLocaleString()}₮</Badge>
                    </div>
                  ) : (
                    <Badge className="bg-teal-400 text-gray-900 font-bold">{course.price.toLocaleString()}₮</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className="border-teal-400/30 text-teal-400 text-xs">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="border-gray-700 bg-gray-800 text-gray-300 text-xs">
                  {getTypeText(course.type)}
                </Badge>
                {course.level && (
                  <Badge variant="outline" className={`${getLevelColor(course.level)} text-xs border-0`}>
                    {getLevelText(course.level)}
                  </Badge>
                )}
              </div>

              {/* Үнэлгээ */}
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-400">{rating.toFixed(1)}</span>
              </div>

              <p className="text-gray-400 line-clamp-2 mb-3 text-sm">{course.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400">{course.lessons?.length || 0} хичээл</span>
                  </div>
                  {course.totalDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-400">{course.totalDuration} мин</span>
                    </div>
                  )}
                </div>

                {course.instructor && (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-800 overflow-hidden">
                      {course.instructor.avatar ? (
                        <img
                          src={course.instructor.avatar || "/placeholder.svg"}
                          alt={course.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-teal-400/10 text-teal-400 font-medium">
                          {course.instructor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-300">{course.instructor.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto p-4 pt-0 flex gap-3">
              <Button
                asChild
                variant="outline"
                className="flex-1 bg-transparent border-teal-400/30 text-teal-400 hover:bg-teal-400/10"
              >
                <a href={`/courses/${course.id}`}>Дэлгэрэнгүй</a>
              </Button>
              <Button
                onClick={() => onAddToCart(course)}
                className="flex-1 bg-teal-400 text-gray-900 hover:bg-teal-500"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Сагсанд
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

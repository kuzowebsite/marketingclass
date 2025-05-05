"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Award, Star } from "lucide-react"
import { useSiteSettings } from "@/lib/site-settings"
import { SocialMediaCoursesSection } from "@/components/social-media-courses-section"
import { useMobile } from "@/hooks/use-mobile"

export default function HomePage() {
  const { settings, loading } = useSiteSettings()
  const { isMobile } = useMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src="/abstract-geometric-flow.png" alt="Background pattern" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-sm">
                Шинэ хичээлүүд нэмэгдлээ
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                {loading ? "Маркетингийн мэдлэгээ дээшлүүлээрэй" : settings.hero?.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                {loading
                  ? "Байгууллага болон хувь хүний контентэд зориулсан маркетингийн мэргэжлийн хичээлүүд. Өөрийн цаг, өөрийн хурдаар суралцаарай."
                  : settings.hero?.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/courses">{loading ? "Хичээлүүд үзэх" : settings.buttons?.viewCourses}</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10" asChild>
                  <Link href="/auth/register">{loading ? "Бүртгүүлэх" : settings.buttons?.register}</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/abstract-colorful-swirls.png"
                alt="Marketing Class Illustration"
                className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {loading ? "15,000+" : settings.statistics?.students}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? "суралцагчид" : settings.statistics?.studentsLabel}
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {loading ? "50+" : settings.statistics?.courses}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? "хичээлүүд" : settings.statistics?.coursesLabel}
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {loading ? "35+" : settings.statistics?.instructors}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? "багш нар" : settings.statistics?.instructorsLabel}
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {loading ? "4.8/5" : settings.statistics?.rating}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? "үнэлгээ" : settings.statistics?.ratingLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Хичээлийн ангилалууд</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Өөрийн сонирхолд тохирсон хичээлүүдийг сонгон суралцаарай
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 md:grid-cols-2 gap-2">
                <TabsTrigger value="social" className="px-4 py-2">
                  Сошиал медиа
                </TabsTrigger>
                <TabsTrigger value="content" className="px-4 py-2">
                  Контент үүсгэлт
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="social" className="space-y-4">
              <SocialMediaCoursesSection />
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Видео контент</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">10 хичээл</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Чанартай видео контент бүтээх, засварлах, нийтлэх
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/courses?category=video">Дэлгэрэнгүй</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Блог бичих</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">7 хичээл</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Уншигчдын анхаарлыг татах блог контент бичих
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/courses?category=blog">Дэлгэрэнгүй</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Подкаст</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">5 хичээл</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Подкаст бичих, хөтлөх, түгээх арга техникүүд
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/courses?category=podcast">Дэлгэрэнгүй</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Өнөөдөр суралцаж эхэлээрэй</h2>
            <p className="text-lg mb-8">
              Маркетингийн мэргэжилтэн болох замд тань бид туслах болно. Манай мэргэжлийн багш нар таныг чиглүүлж,
              дэмжинэ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/courses">Хичээлүүдийг үзэх</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white hover:bg-white hover:text-primary" asChild>
                <Link href="/auth/register">Бүртгүүлэх</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

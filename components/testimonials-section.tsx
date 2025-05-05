"use client"

import { useState, useEffect } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getDatabase, ref, get } from "firebase/database"

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  testimonial: string
  rating: number
  avatar?: string
  isActive: boolean
  createdAt: number
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { app } = useFirebase()

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        if (!app) {
          // If Firebase app is not available, use fallback data
          console.log("Firebase app not available, using fallback data")
          setTestimonials(getFallbackTestimonials())
          setIsLoading(false)
          return
        }

        console.log("Fetching testimonials from database...")
        const db = getDatabase(app)
        const testimonialsRef = ref(db, "testimonials")

        // Get all testimonials and filter client-side to avoid indexing issues
        const snapshot = await get(testimonialsRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          console.log("Raw testimonials data:", data)

          const testimonialsList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))

          console.log("Processed testimonials list:", testimonialsList)

          // Filter active testimonials and sort by createdAt (newest first)
          const activeTestimonials = testimonialsList
            .filter((t) => t.isActive)
            .sort((a, b) => b.createdAt - a.createdAt)

          console.log("Active testimonials:", activeTestimonials)
          setTestimonials(activeTestimonials)
        } else {
          // No testimonials found, use fallback data
          console.log("No testimonials found in database, using fallback data")
          setTestimonials(getFallbackTestimonials())
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error)
        // Use fallback testimonials in case of error
        setTestimonials(getFallbackTestimonials())
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [app])

  // Fallback testimonials in case Firebase fails
  const getFallbackTestimonials = (): Testimonial[] => {
    return [
      {
        id: "1",
        name: "Б. Болормаа",
        role: "Маркетингийн менежер",
        company: "Digital Solutions LLC",
        testimonial:
          "MarketingClass.mn нь миний мэргэжлийн ур чадварыг дээшлүүлэхэд маш их тусалсан. Сургалтууд нь чанартай, практик жишээнүүдтэй.",
        rating: 5,
        avatar: "/woman-with-glasses.png",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        id: "2",
        name: "Д. Батбаяр",
        role: "Гүйцэтгэх захирал",
        company: "Tech Innovation Mongolia",
        testimonial:
          "Энэ платформ дээрх сургалтууд нь манай компанийн маркетингийн багийн ур чадварыг нэмэгдүүлэхэд маш их хувь нэмэр оруулсан.",
        rating: 4,
        avatar: "/professional-man-portrait.png",
        isActive: true,
        createdAt: Date.now() - 86400000,
      },
      {
        id: "3",
        name: "Г. Оюунчимэг",
        role: "Бие даасан зөвлөх",
        company: "Freelance",
        testimonial:
          "Би энэ платформыг бүх маркетингийн мэргэжилтнүүдэд санал болгодог. Үнэхээр үнэ цэнэтэй мэдлэг, ур чадвар олгодог.",
        rating: 5,
        avatar: "/diverse-woman-portrait.png",
        isActive: true,
        createdAt: Date.now() - 172800000,
      },
    ]
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="mb-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // If no testimonials are available, don't render the section
  if (testimonials.length === 0) {
    return <div className="text-center text-gray-500">Одоогоор сэтгэгдэл байхгүй байна.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="h-full hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Avatar>
                {testimonial.avatar ? (
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                ) : (
                  <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                )}
              </Avatar>
              <div className="ml-4">
                <h3 className="font-semibold">{testimonial.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
            <p className="mb-4 text-gray-700 dark:text-gray-300">{testimonial.testimonial}</p>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

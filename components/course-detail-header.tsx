"use client"
import { Badge } from "@/components/ui/badge"

interface CourseDetailHeaderProps {
  course: {
    title: string
    category?: string
    rating?: number
    reviewCount?: number
    students?: number
    thumbnail?: string
    imageUrl?: string
  }
}

export default function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  const { title, category = "Ангилалгүй", rating = 0, reviewCount = 0, students = 0, thumbnail, imageUrl } = course

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {category}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <div className="flex mr-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                </div>
                <span>
                  {rating.toFixed(1)} ({reviewCount} сэтгэгдэл)
                </span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>{students.toLocaleString()} суралцагч</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

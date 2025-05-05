"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Star, ShoppingCart, Clock, Users } from "lucide-react"
import type { Course, CourseLevel } from "@/lib/types"

interface MobileCourseCardProps {
  course: Course
  onAddToCart: (course: Course) => void
  index?: number
}

export function MobileCourseCard({ course, onAddToCart, index = 0 }: MobileCourseCardProps) {
  const [isAdding, setIsAdding] = useState(false)

  // Хичээлийн түвшинг монгол хэлээр харуулах
  const getLevelText = (level?: CourseLevel) => {
    switch (level) {
      case "beginner":
        return "Анхан"
      case "intermediate":
        return "Дунд"
      case "advanced":
        return "Гүнзгий"
      default:
        return "Бүх"
    }
  }

  // Түвшингийн өнгө
  const getLevelColor = (level?: CourseLevel) => {
    switch (level) {
      case "beginner":
        return "bg-teal-500 text-white"
      case "intermediate":
        return "bg-blue-500 text-white"
      case "advanced":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  // Үнийн хөнгөлөлт тооцох
  const discountedPrice = course.discount
    ? Math.round(course.price - (course.price * course.discount) / 100)
    : course.price

  // Үнэлгээний одны тоо
  const rating = course.rating || 4.5

  const handleAddToCart = () => {
    setIsAdding(true)
    onAddToCart(course)
    setTimeout(() => setIsAdding(false), 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden bg-gray-800 border-gray-700">
        <div className="relative">
          {/* Зураг */}
          <div className="h-40 relative overflow-hidden">
            <img
              src={`/generic-placeholder-graphic.png?key=${course.id}&height=160&width=320&query=marketing%20course%20${course.category}`}
              alt={course.title}
              className="w-full h-full object-cover"
            />

            {/* Онцлох тэмдэг */}
            {course.featured && (
              <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
                <Star className="h-3 w-3 mr-1 fill-current" /> Онцлох
              </Badge>
            )}

            {/* Хямдрал & Үнэ */}
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
              {course.discount ? (
                <>
                  <Badge className="bg-red-500 text-white animate-pulse">{course.discount}% хямдрал</Badge>
                  <div className="flex flex-col items-end">
                    <span className="text-xs line-through bg-black/70 text-white px-1.5 py-0.5 rounded">
                      {course.price.toLocaleString()}₮
                    </span>
                    <Badge className="bg-teal-500 text-white font-bold mt-0.5">
                      {discountedPrice.toLocaleString()}₮
                    </Badge>
                  </div>
                </>
              ) : (
                <Badge className="bg-teal-500 text-white font-bold">{course.price.toLocaleString()}₮</Badge>
              )}
            </div>

            {/* Түвшин */}
            <Badge className={`absolute bottom-2 left-2 ${getLevelColor(course.level)}`}>
              {getLevelText(course.level)}
            </Badge>

            {/* Градиент оверлэй */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
          </div>

          {/* Контент */}
          <div className="p-3">
            <h3 className="font-bold text-white mb-1 line-clamp-2">{course.title}</h3>

            {/* Үнэлгээ */}
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-gray-400">{rating.toFixed(1)}</span>
            </div>

            {/* Мэдээлэл */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>{course.lessons?.length || 0} хичээл</span>
              </div>
              {course.totalDuration && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{course.totalDuration} мин</span>
                </div>
              )}
            </div>

            {/* Товчнууд */}
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 h-8 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-700"
              >
                <Link href={`/courses/${course.id}`}>Дэлгэрэнгүй</Link>
              </Button>
              <Button
                size="sm"
                className={`flex-1 h-8 ${
                  isAdding
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500"
                }`}
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                {isAdding ? "Нэмэгдлээ" : "Сагсанд"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

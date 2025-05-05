"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star, Users, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Course } from "@/lib/types"

// Сошиал медиа логонууд
const socialMediaLogos: Record<string, string> = {
  "YouTube Маркетинг": "/youtube-logo.png",
  "Instagram Маркетинг": "/instagram-logo.png",
  "Facebook Маркетинг": "/facebook-logo.png",
  "TikTok Маркетинг": "/social/tiktok.png",
  "LinkedIn Маркетинг": "/linkedin-logo.png",
  "Twitter Маркетинг": "/twitter-logo.png",
}

// Сошиал медиа өнгөнүүд
const socialMediaColors: Record<string, string> = {
  "YouTube Маркетинг": "from-red-500 to-red-700",
  "Instagram Маркетинг": "from-purple-500 to-pink-500",
  "Facebook Маркетинг": "from-blue-500 to-blue-700",
  "TikTok Маркетинг": "from-black to-gray-800",
  "LinkedIn Маркетинг": "from-blue-600 to-blue-800",
  "Twitter Маркетинг": "from-blue-400 to-blue-600",
}

// Түвшингийн монгол нэршил
const levelNames: Record<string, string> = {
  beginner: "Анхан шат",
  intermediate: "Дунд шат",
  advanced: "Ахисан шат",
}

interface SocialMediaCourseCardProps {
  course: Course
}

export default function SocialMediaCourseCard({ course }: SocialMediaCourseCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Хичээлийн үнийг форматлах
  const formatPrice = (price: number, discount?: number) => {
    if (discount) {
      const discountedPrice = price - (price * discount) / 100
      return (
        <div className="flex flex-col">
          <span className="text-lg font-bold">{discountedPrice.toLocaleString()}₮</span>
          <span className="text-sm line-through text-gray-400">{price.toLocaleString()}₮</span>
        </div>
      )
    }
    return <span className="text-lg font-bold">{price.toLocaleString()}₮</span>
  }

  // Сошиал медиа төрлөөс хамаарч градиент өнгө сонгох
  const gradientClass = socialMediaColors[course.category] || "from-gray-700 to-gray-900"

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl shadow-lg bg-black text-white h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        {/* Хичээлийн зураг */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-80`}></div>
        {course.thumbnail ? (
          <Image
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            fill
            className="object-cover mix-blend-overlay"
          />
        ) : (
          <Image src="/abstract-digital-pattern.png" alt={course.title} fill className="object-cover mix-blend-overlay" />
        )}

        {/* Сошиал медиа лого */}
        <div className="absolute top-4 left-4 bg-white p-2 rounded-full">
          <Image
            src={socialMediaLogos[course.category] || "/placeholder.svg?height=40&width=40&query=social media icon"}
            alt={course.category}
            width={24}
            height={24}
          />
        </div>

        {/* Хямдрал байвал харуулах */}
        {course.discount && (
          <div className="absolute top-4 right-4">
            <Badge variant="destructive" className="text-xs font-bold">
              -{course.discount}%
            </Badge>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-1">{course.title}</h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">{course.ratingAvg || 4.5}</span>
          </div>
        </div>

        <p className="text-sm text-gray-300 line-clamp-2">{course.description}</p>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span>{course.viewCount || 0}</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-3 w-3 mr-1" />
            <span>{course.lessons?.length || 0} хичээл</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{levelNames[course.level || "beginner"]}</span>
          </div>
        </div>

        <Link href={`/courses/${course.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white">
            Дэлгэрэнгүй үзэх
          </Button>
        </Link>
      </div>

      {/* Hover animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0"
        animate={{ opacity: isHovered ? 0.6 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

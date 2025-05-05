"use client"

import { useState, useEffect } from "react"
import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase/firebase-config"

// Тестийн өгөгдөл
const FALLBACK_SETTINGS = {
  hero: {
    title: "Маркетингийн мэдлэгээ дээшлүүлээрэй",
    subtitle:
      "Байгууллага болон хувь хүний контентэд зориулсан маркетингийн мэргэжлийн хичээлүүд. Өөрийн цаг, өөрийн хурдаар суралцаарай.",
  },
  buttons: {
    viewCourses: "Хичээлүүд үзэх",
    register: "Бүртгүүлэх",
  },
  statistics: {
    students: "15,000+",
    studentsLabel: "суралцагчид",
    courses: "50+",
    coursesLabel: "хичээлүүд",
    instructors: "35+",
    instructorsLabel: "багш нар",
    rating: "4.8/5",
    ratingLabel: "үнэлгээ",
  },
  featuredCourses: [],
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Өгөгдлийн сангаас тохиргоог дуудах
        const settingsRef = ref(db, "settings")
        const snapshot = await get(settingsRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          setSettings(data)
        } else {
          console.log("No settings found in database, using fallback settings")
          setSettings(FALLBACK_SETTINGS)
        }
      } catch (error) {
        console.error("Error fetching site settings:", error)
        setError("Тохиргоо дуудахад алдаа гарлаа. Тестийн тохиргоог ашиглаж байна.")
        setSettings(FALLBACK_SETTINGS)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings: settings || FALLBACK_SETTINGS, loading, error }
}

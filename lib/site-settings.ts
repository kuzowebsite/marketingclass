"use client"

import { useEffect, useState } from "react"
import { ref, onValue, update } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"

// Default settings
const defaultSettings = {
  siteName: "MarketingClass.mn",
  siteDescription: "Онлайн маркетингийн мэргэжилтэн болох курс нээгдлээ",
  logoUrl: "",
  contactInfo: {
    address: "Улаанбаатар, Чингэлтэй дүүрэг",
    phone: "+976 9911-2233",
    email: "info@marketingclass.mn",
  },
  socialLinks: {
    facebook: "https://facebook.com/marketingclass.mn",
    twitter: "https://twitter.com/marketingclass_mn",
    instagram: "https://instagram.com/marketingclass.mn",
    linkedin: "https://linkedin.com/company/marketingclass-mn",
    youtube: "https://youtube.com/c/marketingclassmn",
  },
  navigation: {
    home: "Нүүр",
    courses: "Хичээлүүд",
    organizations: "Байгууллага",
    individual: "Хувь хүн",
    blog: "Блог",
    leaderboard: "Шилдэг сурагчагчид",
    about: "Бидний тухай",
  },
  buttons: {
    viewCourses: "Хичээлүүд үзэх",
    register: "Бүртгүүлэх",
    login: "Нэвтрэх",
    signUp: "Бүртгүүлэх",
  },
  footer: {
    quickLinks: "Түсламж",
    resources: "Нэмэлт",
    contactUs: "Холбоо барих",
    allRightsReserved: "Бүх эрх хуулиар хамгаалагдсан.",
  },
  hero: {
    title: "Маркетингийн мэдлэгээ дээшлүүлээрэй",
    subtitle:
      "Байгууллага болон хувь хүний контентэд зориулсан маркетингийн мэргэжлийн хичээлүүд. Өөрийн цаг, өөрийн хурдаар суралцаарай.",
  },
  statistics: {
    students: "15,000+",
    courses: "50+",
    instructors: "35+",
    rating: "4.8/5",
    studentsLabel: "суралцагчид",
    coursesLabel: "хичээлүүд",
    instructorsLabel: "багш нар",
    ratingLabel: "үнэлгээ",
  },
}

export function useSiteSettings() {
  const { db } = useFirebase()
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return
    }

    const settingsRef = ref(db, "siteSettings")

    const unsubscribe = onValue(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          console.log("Site settings loaded:", data) // Debug: Өгөгдөл ирж байгааг шалгах

          // Merge with default settings to ensure all properties exist
          setSettings({
            ...defaultSettings,
            ...data,
            // Ensure nested objects are merged properly
            contactInfo: {
              ...defaultSettings.contactInfo,
              ...(data.contactInfo || {}),
            },
            socialLinks: {
              ...defaultSettings.socialLinks,
              ...(data.socialLinks || {}),
            },
            navigation: {
              ...defaultSettings.navigation,
              ...(data.navigation || {}),
            },
            buttons: {
              ...defaultSettings.buttons,
              ...(data.buttons || {}),
            },
            footer: {
              ...defaultSettings.footer,
              ...(data.footer || {}),
            },
            hero: {
              ...defaultSettings.hero,
              ...(data.hero || {}),
            },
            statistics: {
              ...defaultSettings.statistics,
              ...(data.statistics || {}),
            },
            // Make sure logoUrl is included
            logoUrl: data.logoUrl || defaultSettings.logoUrl,
          })
          console.log("Settings after merge:", settings) // Debug: Merge хийсний дараа settings-ийг шалгах
        } else {
          // If no settings exist in the database, use defaults
          setSettings(defaultSettings)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error loading site settings:", error)
        setError(error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [db])

  return { settings, loading, error }
}

export async function updateSiteSettings(db: any, newSettings: any) {
  if (!db) return { success: false, error: "Database not initialized" }

  try {
    const settingsRef = ref(db, "siteSettings")

    // Шууд бүхэл объектыг хадгалах
    await update(settingsRef, newSettings)

    return { success: true }
  } catch (error) {
    console.error("Error updating site settings:", error)
    return { success: false, error }
  }
}

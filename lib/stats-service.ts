import { ref, get } from "firebase/database"
import { db } from "@/lib/firebase/firebase-config"

export interface SiteStats {
  totalCourses: number
  totalStudents: number
  totalInstructors: number
  satisfactionRate: number
}

export async function getSiteStats(): Promise<SiteStats> {
  try {
    // Получение количества курсов
    const coursesRef = ref(db, "courses")
    const coursesSnapshot = await get(coursesRef)
    const totalCourses = coursesSnapshot.exists() ? Object.keys(coursesSnapshot.val()).length : 0

    // Получение количества студентов
    const usersRef = ref(db, "users")
    const usersSnapshot = await get(usersRef)
    const totalStudents = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0

    // Получение количества инструкторов
    const instructorsRef = ref(db, "instructors")
    const instructorsSnapshot = await get(instructorsRef)
    const totalInstructors = instructorsSnapshot.exists() ? Object.keys(instructorsSnapshot.val()).length : 0

    // Получение рейтинга удовлетворенности
    // Предполагаем, что у нас есть коллекция отзывов или рейтингов
    const ratingsRef = ref(db, "ratings")
    const ratingsSnapshot = await get(ratingsRef)

    let satisfactionRate = 98 // Значение по умолчанию

    if (ratingsSnapshot.exists()) {
      const ratings = Object.values(ratingsSnapshot.val()) as any[]
      const totalRatings = ratings.length

      if (totalRatings > 0) {
        const positiveRatings = ratings.filter((rating) => rating.score >= 4).length
        satisfactionRate = Math.round((positiveRatings / totalRatings) * 100)
      }
    }

    return {
      totalCourses,
      totalStudents,
      totalInstructors,
      satisfactionRate,
    }
  } catch (error) {
    console.error("Error fetching site stats:", error)
    // Возвращаем значения по умолчанию в случае ошибки
    return {
      totalCourses: 20,
      totalStudents: 500,
      totalInstructors: 10,
      satisfactionRate: 98,
    }
  }
}

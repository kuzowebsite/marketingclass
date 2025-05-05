import type { FirebaseApp } from "firebase/app"
import { getDatabase, ref, get, set, push, remove, update } from "firebase/database"
import type { Testimonial } from "@/lib/types"

export class TestimonialsService {
  /**
   * Get all testimonials from the database
   */
  static async getTestimonials(app: FirebaseApp): Promise<Testimonial[]> {
    try {
      const db = getDatabase(app)
      const testimonialsRef = ref(db, "testimonials")
      const snapshot = await get(testimonialsRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
      }
      return []
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      throw error
    }
  }

  /**
   * Get only active testimonials from the database
   */
  static async getActiveTestimonials(app: FirebaseApp): Promise<Testimonial[]> {
    try {
      const testimonials = await this.getTestimonials(app)
      return testimonials.filter((testimonial) => testimonial.isActive).sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error("Error fetching active testimonials:", error)
      throw error
    }
  }

  /**
   * Add a new testimonial to the database
   */
  static async addTestimonial(app: FirebaseApp, testimonial: Omit<Testimonial, "id">): Promise<string> {
    try {
      const db = getDatabase(app)
      const testimonialsRef = ref(db, "testimonials")
      const newTestimonialRef = push(testimonialsRef)

      await set(newTestimonialRef, {
        ...testimonial,
        createdAt: testimonial.createdAt || Date.now(),
      })

      return newTestimonialRef.key as string
    } catch (error) {
      console.error("Error adding testimonial:", error)
      throw error
    }
  }

  /**
   * Update an existing testimonial
   */
  static async updateTestimonial(app: FirebaseApp, id: string, testimonial: Partial<Testimonial>): Promise<void> {
    try {
      const db = getDatabase(app)
      const testimonialRef = ref(db, `testimonials/${id}`)
      await update(testimonialRef, testimonial)
    } catch (error) {
      console.error("Error updating testimonial:", error)
      throw error
    }
  }

  /**
   * Delete a testimonial
   */
  static async deleteTestimonial(app: FirebaseApp, id: string): Promise<void> {
    try {
      const db = getDatabase(app)
      const testimonialRef = ref(db, `testimonials/${id}`)
      await remove(testimonialRef)
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      throw error
    }
  }

  /**
   * Toggle testimonial active status
   */
  static async toggleTestimonialStatus(app: FirebaseApp, id: string, isActive: boolean): Promise<void> {
    try {
      await this.updateTestimonial(app, id, { isActive })
    } catch (error) {
      console.error("Error toggling testimonial status:", error)
      throw error
    }
  }
}

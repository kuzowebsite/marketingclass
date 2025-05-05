import { ref, get, update, push, onValue, off, set } from "firebase/database"
import type { Order, PaymentStatus, PaymentVerification } from "@/lib/types"

/**
 * Төлбөрийн статусыг шалгах сервис
 */
export const PaymentService = {
  /**
   * Төлбөрийн статусыг шалгах
   * @param db Firebase database reference
   * @param orderId Order ID
   * @returns Promise with payment status
   */
  checkPaymentStatus: async (db: any, orderId: string): Promise<PaymentStatus> => {
    try {
      const paymentStatusRef = ref(db, `paymentStatus/${orderId}`)
      const snapshot = await get(paymentStatusRef)

      if (snapshot.exists()) {
        return snapshot.val() as PaymentStatus
      }

      return {
        orderId,
        status: "pending",
        message: "Төлбөр хүлээгдэж байна",
        updatedAt: Date.now(),
        verificationCount: 0,
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
      throw error
    }
  },

  /**
   * Төлбөрийн статусыг хянах
   * @param db Firebase database reference
   * @param orderId Order ID
   * @param callback Callback function when status changes
   * @returns Unsubscribe function
   */
  watchPaymentStatus: (db: any, orderId: string, callback: (status: PaymentStatus) => void) => {
    const paymentStatusRef = ref(db, `paymentStatus/${orderId}`)

    const onStatusChange = onValue(paymentStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as PaymentStatus)
      } else {
        callback({
          orderId,
          status: "pending",
          message: "Төлбөр хүлээгдэж байна",
          updatedAt: Date.now(),
          verificationCount: 0,
        })
      }
    })

    // Return unsubscribe function
    return () => off(paymentStatusRef, "value", onStatusChange)
  },

  /**
   * Төлбөрийн статусыг шинэчлэх
   * @param db Firebase database reference
   * @param status Payment status object
   */
  updatePaymentStatus: async (db: any, status: PaymentStatus): Promise<void> => {
    try {
      const paymentStatusRef = ref(db, `paymentStatus/${status.orderId}`)
      await update(paymentStatusRef, {
        ...status,
        updatedAt: Date.now(),
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      throw error
    }
  },

  /**
   * Төлбөрийн баталгаажуулалт нэмэх
   * @param db Firebase database reference
   * @param verification Payment verification object
   */
  addPaymentVerification: async (db: any, verification: PaymentVerification): Promise<void> => {
    try {
      // Add verification record
      const verificationRef = ref(db, `paymentVerifications/${verification.orderId}`)
      const newVerificationRef = push(verificationRef)
      const verificationId = newVerificationRef.key

      if (!verificationId) {
        throw new Error("Failed to generate verification ID")
      }

      // Use set() function instead of newVerificationRef.set()
      await set(newVerificationRef, {
        ...verification,
        id: verificationId,
        createdAt: Date.now(),
      })

      // Update payment status
      const paymentStatusRef = ref(db, `paymentStatus/${verification.orderId}`)
      const statusSnapshot = await get(paymentStatusRef)

      let currentStatus: PaymentStatus

      if (statusSnapshot.exists()) {
        currentStatus = statusSnapshot.val() as PaymentStatus
        currentStatus.verificationCount = (currentStatus.verificationCount || 0) + 1
      } else {
        currentStatus = {
          orderId: verification.orderId,
          status: "pending",
          message: "Төлбөр хүлээгдэж байна",
          updatedAt: Date.now(),
          verificationCount: 1,
        }
      }

      // If admin verified, mark as verified
      if (verification.isAdmin) {
        currentStatus.status = "verified"
        currentStatus.message = "Админ баталгаажуулсан"
        currentStatus.verifiedAt = Date.now()
        currentStatus.verifiedBy = verification.userId
      }

      await update(paymentStatusRef, currentStatus)
    } catch (error) {
      console.error("Error adding payment verification:", error)
      throw error
    }
  },

  /**
   * Төлбөрийн баталгаажуулалтуудыг авах
   * @param db Firebase database reference
   * @param orderId Order ID
   * @returns Promise with payment verifications
   */
  getPaymentVerifications: async (db: any, orderId: string): Promise<PaymentVerification[]> => {
    try {
      const verificationRef = ref(db, `paymentVerifications/${orderId}`)
      const snapshot = await get(verificationRef)

      if (snapshot.exists()) {
        const verifications = snapshot.val()
        return Object.values(verifications) as PaymentVerification[]
      }

      return []
    } catch (error) {
      console.error("Error getting payment verifications:", error)
      throw error
    }
  },

  /**
   * Төлбөрийг баталгаажуулах (Симуляци)
   * @param db Firebase database reference
   * @param orderId Order ID
   * @param paymentMethod Payment method
   * @returns Promise with payment status
   */
  simulatePaymentVerification: async (db: any, orderId: string, paymentMethod: string): Promise<PaymentStatus> => {
    try {
      // Get current order
      const orderRef = ref(db, `orders/${orderId}`)
      const orderSnapshot = await get(orderRef)

      if (!orderSnapshot.exists()) {
        throw new Error("Order not found")
      }

      const order = orderSnapshot.val() as Order

      // Create initial payment status if not exists
      const paymentStatusRef = ref(db, `paymentStatus/${orderId}`)
      const statusSnapshot = await get(paymentStatusRef)

      let currentStatus: PaymentStatus

      if (statusSnapshot.exists()) {
        currentStatus = statusSnapshot.val() as PaymentStatus
      } else {
        currentStatus = {
          orderId,
          status: "pending",
          message: "Төлбөр хүлээгдэж байна",
          updatedAt: Date.now(),
          verificationCount: 0,
        }
      }

      // Simulate different payment methods
      if (["qpay", "socialpay", "monpay", "lendmn"].includes(paymentMethod)) {
        // Mobile wallets - 80% success rate
        if (Math.random() < 0.8) {
          currentStatus.status = "success"
          currentStatus.message = `${paymentMethod.toUpperCase()} төлбөр амжилттай`
          currentStatus.paidAt = Date.now()
          currentStatus.transactionId = `${paymentMethod}_${Math.random().toString(36).substring(2, 10)}`
        } else {
          currentStatus.status = "failed"
          currentStatus.message = "Төлбөр амжилтгүй болсон"
          currentStatus.error = "Хэтэвчний үлдэгдэл хүрэлцэхгүй байна"
        }
      } else if (["visa", "mastercard", "unionpay"].includes(paymentMethod)) {
        // Credit cards - 90% success rate
        if (Math.random() < 0.9) {
          currentStatus.status = "success"
          currentStatus.message = `${paymentMethod.toUpperCase()} картын төлбөр амжилттай`
          currentStatus.paidAt = Date.now()
          currentStatus.transactionId = `${paymentMethod}_${Math.random().toString(36).substring(2, 10)}`
        } else {
          currentStatus.status = "failed"
          currentStatus.message = "Картын төлбөр амжилтгүй болсон"
          currentStatus.error = "Картын мэдээлэл буруу эсвэл картын лимит хүрэлцэхгүй байна"
        }
      } else {
        // Bank transfers - need manual verification
        currentStatus.status = "pending"
        currentStatus.message = "Банкны шилжүүлэг хүлээгдэж байна"
        currentStatus.updatedAt = Date.now()
      }

      // Update payment status
      await update(paymentStatusRef, currentStatus)

      // If payment is successful, update order status
      if (currentStatus.status === "success") {
        await update(orderRef, {
          status: "completed",
          paymentDetails: {
            method: paymentMethod,
            transactionId: currentStatus.transactionId,
            paidAt: currentStatus.paidAt,
          },
        })

        // Update user's purchased courses
        const userRef = ref(db, `users/${order.userId}`)
        const userSnapshot = await get(userRef)

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val()
          const currentPurchasedCourses = userData.purchasedCourses || []

          // Add new course IDs from this order
          const newCourseIds = order.items.map((item) => item.id)
          const updatedCourses = [...new Set([...currentPurchasedCourses, ...newCourseIds])]

          // Update user's purchased courses
          await update(userRef, { purchasedCourses: updatedCourses })
        }
      }

      return currentStatus
    } catch (error) {
      console.error("Error simulating payment verification:", error)
      throw error
    }
  },
}

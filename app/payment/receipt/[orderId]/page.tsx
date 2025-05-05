"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get } from "firebase/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Download, Printer } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import type { Order, PaymentStatus } from "@/lib/types"
import { PaymentService } from "@/lib/payment/payment-service"

export default function ReceiptPage() {
  const params = useParams()
  const router = useRouter()
  const { user, db } = useFirebase()
  const [order, setOrder] = useState<Order | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const orderId = params.orderId as string

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user || !db || !orderId) {
        setLoading(false)
        return
      }

      try {
        // Fetch order
        const orderRef = ref(db, `orders/${orderId}`)
        const orderSnapshot = await get(orderRef)

        if (!orderSnapshot.exists()) {
          router.push("/payment/history")
          return
        }

        const orderData = orderSnapshot.val()

        // Check if order belongs to current user
        if (orderData.userId !== user.uid) {
          router.push("/payment/history")
          return
        }

        setOrder({ ...orderData, id: orderId })

        // Fetch payment status
        const status = await PaymentService.checkPaymentStatus(db, orderId)
        setPaymentStatus(status)
      } catch (error) {
        console.error("Error fetching order details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [user, db, orderId, router])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>

              <Separator />

              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>

              <Separator />

              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Нэвтрээгүй байна</h1>
        <p className="mb-8">Баримт харахын тулд нэвтэрнэ үү.</p>
        <Link href="/auth/login">
          <Button size="lg">Нэвтрэх</Button>
        </Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Захиалга олдсонгүй</h1>
        <p className="mb-8">Таны хайсан захиалга олдсонгүй эсвэл танд энэ захиалгыг харах эрх байхгүй байна.</p>
        <Link href="/payment/history">
          <Button size="lg">Төлбөрийн түүх рүү буцах</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <Link href={`/payment/history/${orderId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Төлбөрийн баримт</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img src="/abstract-logo.png" alt="Logo" className="h-10 w-10" />
                <h2 className="text-xl font-bold">MarketingClass.mn</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Баримт #{orderId.slice(-6)}</p>
                <p className="text-sm">
                  {new Date(order.createdAt).toLocaleDateString("mn-MN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Хэрэглэгч:</p>
                <p className="font-medium">{user.displayName || "Хэрэглэгч"}</p>
                <p>{user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Төлбөрийн хэрэгсэл:</p>
                <p className="font-medium capitalize">{order.paymentMethod}</p>
                {paymentStatus?.transactionId && <p className="text-sm font-mono">{paymentStatus.transactionId}</p>}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-4">Захиалгын мэдээлэл</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p>{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.type === "organization" ? "Байгууллагын" : "Хувь хүний"} • {item.category}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price)} ₮</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <p className="font-medium">Нийт дүн:</p>
              <p className="text-xl font-bold">{formatCurrency(order.totalAmount)} ₮</p>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
              <p>MarketingClass.mn - Маркетингийн онлайн сургалтын платформ</p>
              <p>info@marketingclass.mn • +976 99112233</p>
              <p>© {new Date().getFullYear()} MarketingClass.mn. Бүх эрх хуулиар хамгаалагдсан.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

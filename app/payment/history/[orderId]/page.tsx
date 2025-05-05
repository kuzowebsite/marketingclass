"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get } from "firebase/database"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Download, Receipt, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import type { Order, PaymentStatus, PaymentVerification } from "@/lib/types"
import { PaymentService } from "@/lib/payment/payment-service"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, db } = useFirebase()
  const [order, setOrder] = useState<Order | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [verifications, setVerifications] = useState<PaymentVerification[]>([])
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

        // Fetch payment verifications
        const verificationsList = await PaymentService.getPaymentVerifications(db, orderId)
        setVerifications(verificationsList)
      } catch (error) {
        console.error("Error fetching order details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [user, db, orderId, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "verified":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "pending":
      case "processing":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "failed":
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Амжилттай"
      case "verified":
        return "Баталгаажсан"
      case "pending":
        return "Хүлээгдэж буй"
      case "processing":
        return "Боловсруулж байна"
      case "failed":
        return "Амжилтгүй"
      case "cancelled":
        return "Цуцлагдсан"
      default:
        return status
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
      case "verified":
        return "success"
      case "pending":
      case "processing":
        return "warning"
      case "failed":
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Нэвтрээгүй байна</h1>
        <p className="mb-8">Захиалгын дэлгэрэнгүйг харахын тулд нэвтэрнэ үү.</p>
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/payment/history">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Захиалга #{orderId.slice(-6)}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Захиалгын мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Захиалгын дугаар:</span>
                  <span className="font-medium">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Огноо:</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("mn-MN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Төлбөрийн хэрэгсэл:</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Статус:</span>
                  <div className="flex items-center gap-2">
                    {paymentStatus && getStatusIcon(paymentStatus.status)}
                    <Badge variant={paymentStatus ? getStatusBadgeVariant(paymentStatus.status) : "secondary"}>
                      {paymentStatus ? getStatusText(paymentStatus.status) : getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
                {paymentStatus?.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Гүйлгээний дугаар:</span>
                    <span className="font-mono">{paymentStatus.transactionId}</span>
                  </div>
                )}
                {paymentStatus?.message && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Мессеж:</span>
                    <span>{paymentStatus.message}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Захиалсан хичээлүүд</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.type === "organization" ? "Байгууллагын" : "Хувь хүний"} • {item.category}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price)} ₮</p>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="flex justify-between items-center font-medium">
                  <span>Нийт дүн:</span>
                  <span className="text-lg">{formatCurrency(order.totalAmount)} ₮</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {verifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Төлбөрийн баталгаажуулалт</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verifications.map((verification, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {verification.isAdmin ? "Админ баталгаажуулалт" : "Хэрэглэгчийн баталгаажуулалт"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {verification.userName || "Хэрэглэгч"} •{" "}
                            {new Date(verification.createdAt || 0).toLocaleDateString("mn-MN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Badge
                          variant={
                            verification.status === "approved"
                              ? "success"
                              : verification.status === "rejected"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {verification.status === "approved"
                            ? "Баталгаажсан"
                            : verification.status === "rejected"
                              ? "Татгалзсан"
                              : "Хүлээгдэж буй"}
                        </Badge>
                      </div>
                      {verification.notes && (
                        <p className="text-sm mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">{verification.notes}</p>
                      )}
                      {verification.transactionId && (
                        <p className="text-sm mt-2">
                          <span className="text-gray-500 dark:text-gray-400">Гүйлгээний дугаар: </span>
                          <span className="font-mono">{verification.transactionId}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Төлбөрийн статус</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center p-4">
                {paymentStatus && getStatusIcon(paymentStatus.status)}
                <h3 className="text-lg font-medium mt-2">
                  {paymentStatus ? getStatusText(paymentStatus.status) : getStatusText(order.status)}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {paymentStatus?.message || "Төлбөрийн статус мэдээлэл байхгүй байна."}
                </p>

                {paymentStatus?.status === "pending" && (
                  <div className="mt-4 w-full">
                    <Button className="w-full" onClick={() => router.refresh()}>
                      Статус шинэчлэх
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Үйлдлүүд</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={`/payment/receipt/${orderId}`}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Баримт харах
                </Button>
              </Link>

              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Баримт татах
              </Button>

              {paymentStatus?.status === "failed" && (
                <Link href={`/payment/${orderId}`}>
                  <Button className="w-full">Дахин төлөх</Button>
                </Link>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/courses" className="w-full">
                <Button variant="secondary" className="w-full">
                  Хичээлүүд рүү буцах
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

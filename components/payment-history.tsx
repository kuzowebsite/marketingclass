"use client"

import { useState, useEffect } from "react"
import { ref, get } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Receipt } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import type { Order, PaymentStatus } from "@/lib/types"
import { PaymentService } from "@/lib/payment/payment-service"

interface PaymentHistoryProps {
  limit?: number
  showViewAll?: boolean
}

export default function PaymentHistory({ limit, showViewAll = true }: PaymentHistoryProps) {
  const { user, db } = useFirebase()
  const [orders, setOrders] = useState<(Order & { paymentStatus?: PaymentStatus })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !db) {
        setLoading(false)
        return
      }

      try {
        // Get all orders and filter client-side instead of using query
        const ordersRef = ref(db, "orders")
        const snapshot = await get(ordersRef)

        if (snapshot.exists()) {
          const ordersData = snapshot.val()
          const ordersArray = Object.keys(ordersData)
            .map((key) => ({
              ...ordersData[key],
              id: key,
            }))
            .filter((order) => order.userId === user.uid) // Filter by userId client-side

          // Sort by createdAt in descending order
          ordersArray.sort((a, b) => b.createdAt - a.createdAt)

          // Limit if specified
          const limitedOrders = limit ? ordersArray.slice(0, limit) : ordersArray

          // Fetch payment status for each order
          const ordersWithStatus = await Promise.all(
            limitedOrders.map(async (order) => {
              try {
                const paymentStatus = await PaymentService.checkPaymentStatus(db, order.id)
                return { ...order, paymentStatus }
              } catch (error) {
                console.error(`Error fetching payment status for order ${order.id}:`, error)
                return order
              }
            }),
          )

          setOrders(ordersWithStatus)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, db, limit])

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 3)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex justify-end mt-4">
                    <Skeleton className="h-9 w-9 rounded-md mr-2" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Танд одоогоор захиалга байхгүй байна.</p>
          <Link href="/courses">
            <Button>Хичээлүүд харах</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">Захиалга #{order.id.slice(-6)}</h3>
                  <Badge
                    variant={
                      order.paymentStatus
                        ? getStatusBadgeVariant(order.paymentStatus.status)
                        : getStatusBadgeVariant(order.status)
                    }
                    className="ml-2"
                  >
                    {order.paymentStatus ? getStatusText(order.paymentStatus.status) : getStatusText(order.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("mn-MN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(order.totalAmount)} ₮ • {order.items.length} хичээл
                </p>
                {order.paymentStatus?.message && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.paymentStatus.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-start">
                <Link href={`/payment/receipt/${order.id}`}>
                  <Button size="icon" variant="outline" title="Баримт харах">
                    <Receipt className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/payment/history/${order.id}`}>
                  <Button size="icon" variant="outline" title="Дэлгэрэнгүй харах">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {showViewAll && orders.length >= (limit || 0) && (
        <div className="flex justify-center mt-4">
          <Link href="/payment/history">
            <Button variant="outline">Бүх захиалга харах</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ref, get, update } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, Search, XCircle, AlertCircle } from "lucide-react"
import type { Order, PaymentStatus, PaymentVerification } from "@/lib/types"
import { PaymentService } from "@/lib/payment/payment-service"

type PaymentStatusType = "pending" | "processing" | "success" | "verified" | "failed" | "cancelled"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [verifications, setVerifications] = useState<PaymentVerification[]>([])
  const [verificationNote, setVerificationNote] = useState("")
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)

  const { db, user, isInitialized } = useFirebase()
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isInitialized || !db) {
        setLoading(false)
        setError("Firebase холболт амжилтгүй болсон байна. Хуудсыг дахин ачаална уу.")
        return
      }

      if (!user?.isAdmin) {
        // The admin check is already handled by the layout component
        // We don't need to check again here, as the layout prevents non-admins from accessing this page
      }

      try {
        setLoading(true)
        setError(null)

        // Use query to order by createdAt in descending order
        const ordersRef = ref(db, "orders")
        const snapshot = await get(ordersRef)

        if (snapshot.exists()) {
          const ordersData = snapshot.val()
          const ordersArray = Object.values(ordersData) as Order[]

          // Sort by date (newest first)
          ordersArray.sort((a, b) => b.createdAt - a.createdAt)

          setOrders(ordersArray)
          setFilteredOrders(ordersArray)

          toast({
            title: "Амжилттай",
            description: `${ordersArray.length} захиалга ачааллаа`,
          })
        } else {
          setOrders([])
          setFilteredOrders([])
          toast({
            title: "Мэдээлэл",
            description: "Захиалга олдсонгүй",
          })
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError("Захиалгууд ачаалахад алдаа гарлаа. Дахин оролдоно уу.")
        toast({
          title: "Алдаа",
          description: "Захиалгууд ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [db, user, toast, isInitialized])

  useEffect(() => {
    // Filter orders based on search term and status
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Хүлээгдэж буй
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Баталгаажсан
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Цуцлагдсан
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order)

    try {
      if (!db) {
        toast({
          title: "Алдаа",
          description: "Өгөгдлийн сан холбогдоогүй байна",
          variant: "destructive",
        })
        return
      }

      // Get payment status
      const status = await PaymentService.checkPaymentStatus(db, order.id)
      setPaymentStatus(status)

      // Get payment verifications
      const verificationList = await PaymentService.getPaymentVerifications(db, order.id)
      setVerifications(verificationList)
    } catch (error) {
      console.error("Error fetching payment details:", error)
      toast({
        title: "Алдаа",
        description: "Төлбөрийн мэдээлэл ачаалахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleVerifyPayment = async () => {
    if (!selectedOrder || !db || !user) return

    try {
      // Add verification
      await PaymentService.addPaymentVerification(db, {
        orderId: selectedOrder.id,
        userId: user.uid,
        userName: user.displayName || user.email || "Админ",
        isAdmin: true,
        method: selectedOrder.paymentMethod,
        amount: selectedOrder.totalAmount,
        notes: verificationNote,
        status: "approved",
      })

      // Update order status
      const orderRef = ref(db, `orders/${selectedOrder.id}`)
      await update(orderRef, { status: "completed" })

      // Update user's purchased courses
      const orderSnapshot = await get(orderRef)
      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.val() as Order

        // Get user's current purchased courses
        const userRef = ref(db, `users/${orderData.userId}`)
        const userSnapshot = await get(userRef)

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val()
          const currentPurchasedCourses = userData.purchasedCourses || []

          // Add new course IDs from this order
          const newCourseIds = orderData.items.map((item) => item.id)
          const updatedCourses = [...new Set([...currentPurchasedCourses, ...newCourseIds])]

          // Update user's purchased courses
          await update(userRef, { purchasedCourses: updatedCourses })
        }
      }

      // Update orders list
      setOrders(orders.map((order) => (order.id === selectedOrder.id ? { ...order, status: "completed" } : order)))

      // Get updated payment status
      const status = await PaymentService.checkPaymentStatus(db, selectedOrder.id)
      setPaymentStatus(status)

      // Get updated verifications
      const verificationList = await PaymentService.getPaymentVerifications(db, selectedOrder.id)
      setVerifications(verificationList)

      toast({
        title: "Амжилттай",
        description: "Төлбөр амжилттай баталгаажлаа",
      })

      setVerifyDialogOpen(false)
      setVerificationNote("")
    } catch (error) {
      console.error("Error verifying payment:", error)
      toast({
        title: "Алдаа",
        description: "Төлбөр баталгаажуулахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleCancelOrder = async () => {
    if (!selectedOrder || !db) return

    try {
      // Update order status
      const orderRef = ref(db, `orders/${selectedOrder.id}`)
      await update(orderRef, { status: "cancelled" })

      // Update payment status
      await PaymentService.updatePaymentStatus(db, {
        orderId: selectedOrder.id,
        status: "cancelled",
        message: "Захиалга цуцлагдсан",
        updatedAt: Date.now(),
        verificationCount: (paymentStatus?.verificationCount || 0) + 1,
      })

      // Update orders list
      setOrders(orders.map((order) => (order.id === selectedOrder.id ? { ...order, status: "cancelled" } : order)))

      // Get updated payment status
      const status = await PaymentService.checkPaymentStatus(db, selectedOrder.id)
      setPaymentStatus(status)

      toast({
        title: "Амжилттай",
        description: "Захиалга цуцлагдсан",
      })

      setSelectedOrder(null)
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Алдаа",
        description: "Захиалга цуцлахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const renderPaymentStatusBadge = (status: PaymentStatusType) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Хүлээгдэж буй
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Боловсруулж байна
          </Badge>
        )
      case "success":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Амжилттай
          </Badge>
        )
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Баталгаажсан
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Амжилтгүй
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Цуцлагдсан
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Захиалгууд ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Алдаа гарлаа</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Дахин оролдох
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Захиалгын удирдлага</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Захиалга хайх..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={handleStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">Бүгд</TabsTrigger>
            <TabsTrigger value="pending">Хүлээгдэж буй</TabsTrigger>
            <TabsTrigger value="completed">Баталгаажсан</TabsTrigger>
            <TabsTrigger value="cancelled">Цуцлагдсан</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Захиалга олдсонгүй</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Захиалга #{order.id.slice(0, 6)}</CardTitle>
                    <CardDescription>Үүсгэсэн: {formatDate(order.createdAt)}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-sm font-medium">{order.totalAmount.toLocaleString()}₮</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Хэрэглэгч: {order.userId}</p>
                    <p className="text-sm text-muted-foreground">
                      Төлбөрийн хэлбэр: {order.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-2">Захиалсан хичээлүүд: {order.items.length}</p>
                    <Button size="sm" onClick={() => handleViewOrder(order)}>
                      Дэлгэрэнгүй
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Захиалгын дэлгэрэнгүй</DialogTitle>
              <DialogDescription>
                Захиалга #{selectedOrder.id.slice(0, 6)} | Үүсгэсэн: {formatDate(selectedOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Захиалгын мэдээлэл</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Статус:</span>
                      <span>{getStatusBadge(selectedOrder.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Хэрэглэгч ID:</span>
                      <span>{selectedOrder.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Төлбөрийн хэлбэр:</span>
                      <span>{selectedOrder.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Нийт дүн:</span>
                      <span className="font-bold">{selectedOrder.totalAmount.toLocaleString()}₮</span>
                    </div>
                    {selectedOrder.referralCode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Урилгын код:</span>
                        <span>{selectedOrder.referralCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Төлбөрийн статус</h3>
                  {paymentStatus ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Статус:</span>
                        <span>{renderPaymentStatusBadge(paymentStatus.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Мессеж:</span>
                        <span>{paymentStatus.message}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Шалгалтын тоо:</span>
                        <span>{paymentStatus.verificationCount}</span>
                      </div>
                      {paymentStatus.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Гүйлгээний дугаар:</span>
                          <span>{paymentStatus.transactionId}</span>
                        </div>
                      )}
                      {paymentStatus.paidAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Төлсөн огноо:</span>
                          <span>{formatDate(paymentStatus.paidAt)}</span>
                        </div>
                      )}
                      {paymentStatus.verifiedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Баталгаажуулсан огноо:</span>
                          <span>{formatDate(paymentStatus.verifiedAt)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Төлбөрийн статус олдсонгүй</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Захиалсан хичээлүүд</h3>
                <div className="border rounded-md divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-2 flex justify-between">
                      <span>{item.title}</span>
                      <span>{item.price.toLocaleString()}₮</span>
                    </div>
                  ))}
                  <div className="p-2 flex justify-between font-bold">
                    <span>Нийт дүн:</span>
                    <span>{selectedOrder.totalAmount.toLocaleString()}₮</span>
                  </div>
                </div>
              </div>

              {verifications.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Төлбөрийн баталгаажуулалтууд</h3>
                  <div className="border rounded-md divide-y">
                    {verifications.map((verification) => (
                      <div key={verification.id} className="p-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{verification.userName || verification.userId}</span>
                          <span>{verification.isAdmin ? "Админ" : "Хэрэглэгч"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {verification.createdAt ? formatDate(verification.createdAt) : ""}
                          </span>
                          <span>{verification.status === "approved" ? "Баталгаажсан" : "Хүлээгдэж буй"}</span>
                        </div>
                        {verification.notes && <p className="text-sm mt-1">{verification.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                <div className="flex gap-2">
                  {selectedOrder.status === "pending" && (
                    <>
                      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="default">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Төлбөр баталгаажуулах
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Төлбөр баталгаажуулах</DialogTitle>
                            <DialogDescription>
                              Захиалга #{selectedOrder.id.slice(0, 6)} төлбөрийг баталгаажуулах
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="verificationNote">Тэмдэглэл</Label>
                              <Textarea
                                id="verificationNote"
                                placeholder="Төлбөрийн тэмдэглэл..."
                                value={verificationNote}
                                onChange={(e) => setVerificationNote(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                              Цуцлах
                            </Button>
                            <Button onClick={handleVerifyPayment}>Баталгаажуулах</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button variant="destructive" onClick={handleCancelOrder}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Захиалга цуцлах
                      </Button>
                    </>
                  )}
                </div>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Хаах
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

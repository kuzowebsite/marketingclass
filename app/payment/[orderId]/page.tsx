"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ref, get, update, push } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { Order, User as UserType, ReferralReward, PaymentStatus } from "@/lib/types"
import { CheckCircle, Copy, ArrowLeft, ExternalLink, Clock, CheckSquare, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaymentService } from "@/lib/payment/payment-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [verificationAttempts, setVerificationAttempts] = useState(0)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })
  const [paymentInfo, setPaymentInfo] = useState({
    qpay: { account: "123456789", name: "MarketingClass", qrCode: "/payment/qpay-qr.png" },
    socialpay: { phone: "99112233", name: "MarketingClass", qrCode: "/payment/socialpay-qr.png" },
    monpay: { phone: "99112233", name: "MarketingClass", qrCode: "/payment/monpay-qr.png" },
    lendmn: { phone: "99112233", name: "MarketingClass", qrCode: "/payment/lendmn-qr.png" },
    khanbank: { account: "5000123456", bank: "Хаан Банк", name: "MarketingClass ХХК" },
    golomtbank: { account: "1234567890", bank: "Голомт Банк", name: "MarketingClass ХХК" },
    statebank: { account: "0987654321", bank: "Төрийн Банк", name: "MarketingClass ХХК" },
    tdbbank: { account: "2468013579", bank: "Худалдаа Хөгжлийн Банк", name: "MarketingClass ХХК" },
    xacbank: { account: "1357924680", bank: "Хас Банк", name: "MarketingClass ХХК" },
  })

  const { db, user } = useFirebase()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrder = async () => {
      if (!db || !user) {
        router.push("/auth/login")
        return
      }

      try {
        const orderRef = ref(db, `orders/${orderId}`)
        const snapshot = await get(orderRef)

        if (snapshot.exists()) {
          const orderData = snapshot.val() as Order

          // Check if order belongs to current user
          if (orderData.userId !== user.uid) {
            toast({
              title: "Хандалт хаалттай",
              description: "Танд энэ захиалгыг харах эрх байхгүй байна",
              variant: "destructive",
            })
            router.push("/")
            return
          }

          setOrder(orderData)

          // Check payment status
          const status = await PaymentService.checkPaymentStatus(db, orderId)
          setPaymentStatus(status)

          // Watch for payment status changes
          const unsubscribe = PaymentService.watchPaymentStatus(db, orderId, (status) => {
            setPaymentStatus(status)

            // If payment is successful, update UI
            if (status.status === "success" || status.status === "verified") {
              setProcessingPayment(false)

              toast({
                title: "Төлбөр амжилттай",
                description: status.message,
              })

              // Redirect to profile after 3 seconds
              setTimeout(() => {
                router.push("/profile")
              }, 3000)
            }

            // If payment failed, show error
            if (status.status === "failed") {
              setProcessingPayment(false)

              toast({
                title: "Төлбөр амжилтгүй",
                description: status.message,
                variant: "destructive",
              })
            }
          })

          // Cleanup subscription
          return () => unsubscribe()
        } else {
          toast({
            title: "Алдаа",
            description: "Захиалга олдсонгүй",
            variant: "destructive",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Алдаа",
          description: "Захиалга ачаалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [db, orderId, router, toast, user])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Амжилттай",
      description: "Хуулагдлаа",
    })
  }

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardDetails({
      ...cardDetails,
      [name]: value,
    })
  }

  const handleCardPayment = async () => {
    if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
      toast({
        title: "Анхааруулга",
        description: "Картын мэдээллийг бүрэн оруулна уу",
        variant: "destructive",
      })
      return
    }

    setProcessingPayment(true)

    try {
      // Simulate payment processing
      const status = await PaymentService.simulatePaymentVerification(db, orderId, order?.paymentMethod || "visa")
      setPaymentStatus(status)

      if (status.status === "failed") {
        setProcessingPayment(false)
        toast({
          title: "Төлбөр амжилтгүй",
          description: status.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      setProcessingPayment(false)
      toast({
        title: "Алдаа",
        description: "Төлбөр боловсруулахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const handleExternalPayment = async (paymentMethod: string) => {
    setProcessingPayment(true)

    toast({
      title: "Төлбөр хийгдэж байна",
      description: `${paymentMethod} төлбөрийн системд холбогдож байна...`,
    })

    try {
      // Simulate payment processing
      const status = await PaymentService.simulatePaymentVerification(db, orderId, paymentMethod)
      setPaymentStatus(status)

      if (status.status === "failed") {
        setProcessingPayment(false)
        toast({
          title: "Төлбөр амжилтгүй",
          description: status.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      setProcessingPayment(false)
      toast({
        title: "Алдаа",
        description: "Төлбөр боловсруулахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const verifyPayment = async () => {
    if (!db || !order) return

    setVerificationAttempts((prev) => prev + 1)

    try {
      // Check payment status
      const status = await PaymentService.checkPaymentStatus(db, orderId)
      setPaymentStatus(status)

      if (status.status === "success" || status.status === "verified") {
        toast({
          title: "Төлбөр амжилттай",
          description: status.message,
        })

        // Redirect to profile after 3 seconds
        setTimeout(() => {
          router.push("/profile")
        }, 3000)
      } else if (status.status === "pending") {
        // Add verification attempt
        await PaymentService.addPaymentVerification(db, {
          orderId,
          userId: user!.uid,
          userName: user!.displayName || user!.email || "Хэрэглэгч",
          isAdmin: false,
          method: order.paymentMethod,
          amount: order.totalAmount,
          notes: "Хэрэглэгчийн шалгалт",
          status: "pending",
        })

        toast({
          title: "Төлбөр шалгагдаж байна",
          description: "Таны төлбөрийг шалгаж байна. Удахгүй баталгаажуулах болно.",
        })
      } else {
        toast({
          title: "Төлбөр амжилтгүй",
          description: status.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      toast({
        title: "Алдаа",
        description: "Төлбөр шалгахад алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const completePayment = async () => {
    if (!db || !order) return

    try {
      setProcessingPayment(true)

      // Update order status
      const orderRef = ref(db, `orders/${orderId}`)
      await update(orderRef, { status: "completed" })

      // Update user's purchased courses
      const userPurchasedCoursesRef = ref(db, `users/${user!.uid}/purchasedCourses`)
      const snapshot = await get(userPurchasedCoursesRef)

      let purchasedCourses: string[] = []
      if (snapshot.exists()) {
        purchasedCourses = snapshot.val()
      }

      // Add new course IDs
      const newCourseIds = order.items.map((item) => item.id)
      const updatedCourses = [...new Set([...purchasedCourses, ...newCourseIds])]

      await update(ref(db, `users/${user!.uid}`), { purchasedCourses: updatedCourses })

      // Process referral if exists
      if (order.referralCode) {
        // Find referrer user
        const usersRef = ref(db, "users")
        const usersSnapshot = await get(usersRef)

        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val() as Record<string, UserType>
          const referrer = Object.values(users).find((u) => u.referralCode === order.referralCode)

          if (referrer) {
            // Calculate reward (10% of order total)
            const rewardAmount = Math.round(order.totalAmount * 0.1)
            const rewardPoints = 50 // Fixed points per referral

            // Create referral reward record
            const rewardsRef = ref(db, "referralRewards")
            const newRewardRef = push(rewardsRef)

            const rewardData: ReferralReward = {
              id: newRewardRef.key!,
              referrerId: referrer.uid,
              refereeId: user!.uid,
              courseId: order.items[0].id, // Use first course ID
              amount: rewardAmount,
              points: rewardPoints,
              createdAt: Date.now(),
            }

            await newRewardRef.set(rewardData)

            // Update referrer's points
            const currentPoints = referrer.points || 0
            await update(ref(db, `users/${referrer.uid}`), {
              points: currentPoints + rewardPoints,
            })

            // Award badge if first referral
            const referralRewardsRef = ref(db, "referralRewards")
            const referralRewardsSnapshot = await get(referralRewardsRef)

            if (referralRewardsSnapshot.exists()) {
              const rewards = Object.values(referralRewardsSnapshot.val() as Record<string, ReferralReward>)
              const referrerRewards = rewards.filter((r) => r.referrerId === referrer.uid)

              if (referrerRewards.length === 1) {
                // This is their first referral
                const userBadgesRef = ref(db, `users/${referrer.uid}/badges`)

                const referralBadge = {
                  id: `referral-champion-${Date.now()}`,
                  name: "Урилгын аварга",
                  description: "Анхны амжилттай урилга",
                  icon: "referral-champion",
                  earnedAt: Date.now(),
                }

                await update(userBadgesRef, {
                  [`referral-champion-${Date.now()}`]: referralBadge,
                })
              }
            }
          }
        }
      }

      // Update payment status
      await PaymentService.updatePaymentStatus(db, {
        orderId,
        status: "verified",
        message: "Төлбөр амжилттай баталгаажлаа",
        updatedAt: Date.now(),
        verificationCount: (paymentStatus?.verificationCount || 0) + 1,
        verifiedAt: Date.now(),
        verifiedBy: user!.uid,
      })

      toast({
        title: "Амжилттай",
        description: "Төлбөр амжилттай баталгаажлаа",
      })

      router.push("/profile")
    } catch (error) {
      console.error("Error completing payment:", error)
      toast({
        title: "Алдаа",
        description: "Төлбөр баталгаажуулахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const renderPaymentStatus = () => {
    if (!paymentStatus) return null

    switch (paymentStatus.status) {
      case "pending":
        return (
          <Alert className="mb-4">
            <Clock className="h-4 w-4" />
            <AlertTitle>Төлбөр хүлээгдэж байна</AlertTitle>
            <AlertDescription>
              Таны төлбөр хүлээгдэж байна. Төлбөр хийсний дараа "Төлбөр шалгах" товчийг дарна уу.
            </AlertDescription>
          </Alert>
        )
      case "processing":
        return (
          <Alert className="mb-4">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <AlertTitle>Төлбөр боловсруулагдаж байна</AlertTitle>
            <AlertDescription>Таны төлбөр боловсруулагдаж байна. Энэ хэдэн секунд үргэлжилнэ.</AlertDescription>
            <Progress value={65} className="mt-2" />
          </Alert>
        )
      case "success":
        return (
          <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-300">Төлбөр амжилттай</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              Таны төлбөр амжилттай хийгдлээ. Захиалга баталгаажлаа.
              {paymentStatus.transactionId && (
                <div className="mt-1">
                  Гүйлгээний дугаар: <span className="font-medium">{paymentStatus.transactionId}</span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )
      case "verified":
        return (
          <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckSquare className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-300">Төлбөр баталгаажсан</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              Таны төлбөр баталгаажлаа. Захиалга амжилттай.
            </AlertDescription>
          </Alert>
        )
      case "failed":
        return (
          <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950" variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Төлбөр амжилтгүй</AlertTitle>
            <AlertDescription>
              {paymentStatus.message || "Төлбөр хийхэд алдаа гарлаа. Дахин оролдоно уу."}
              {paymentStatus.error && <div className="mt-1">{paymentStatus.error}</div>}
            </AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  const renderPaymentMethod = () => {
    if (!order) return null

    const method = order.paymentMethod

    // Bank transfers
    if (["khanbank", "golomtbank", "statebank", "tdbbank", "xacbank"].includes(method)) {
      const bankInfo = paymentInfo[method as keyof typeof paymentInfo]
      return (
        <div className="space-y-4">
          {renderPaymentStatus()}

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h3 className="font-medium mb-2">Банкаар шилжүүлэх</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Банк:</span>
                <span className="font-medium">{(bankInfo as any).bank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Данс:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{(bankInfo as any).account}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard((bankInfo as any).account)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Хүлээн авагч:</span>
                <span>{(bankInfo as any).name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Дүн:</span>
                <span className="font-bold">{order.totalAmount.toLocaleString()}₮</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Гүйлгээний утга:</span>
                <div className="flex items-center gap-2">
                  <span>{orderId.slice(0, 8)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(orderId.slice(0, 8))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" className="mr-2" onClick={() => router.push("/cart")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Буцах
            </Button>
            <Button
              onClick={verifyPayment}
              disabled={
                processingPayment || paymentStatus?.status === "success" || paymentStatus?.status === "verified"
              }
            >
              {processingPayment ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Боловсруулж байна...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Төлбөр шалгах
                </>
              )}
            </Button>
          </div>
        </div>
      )
    }

    // Mobile wallets (QPay, SocialPay, etc.)
    if (["qpay", "socialpay", "monpay", "lendmn"].includes(method)) {
      const walletInfo = paymentInfo[method as keyof typeof paymentInfo]
      return (
        <div className="space-y-4">
          {renderPaymentStatus()}

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h3 className="font-medium mb-4 text-center">{method.toUpperCase()} төлбөр</h3>

            <div className="flex flex-col items-center mb-4">
              <div className="bg-white p-2 rounded-lg mb-2 w-48 h-48 flex items-center justify-center">
                <img
                  src={`/abstract-geometric-shapes.png?height=180&width=180&query=${method} QR code`}
                  alt={`${method} QR код`}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">QR кодыг уншуулж төлбөрөө төлнө үү</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Утас:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{(walletInfo as any).phone}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard((walletInfo as any).phone)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Хүлээн авагч:</span>
                <span>{(walletInfo as any).name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Дүн:</span>
                <span className="font-bold">{order.totalAmount.toLocaleString()}₮</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Гүйлгээний утга:</span>
                <div className="flex items-center gap-2">
                  <span>{orderId.slice(0, 8)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(orderId.slice(0, 8))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.push("/cart")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Буцах
            </Button>
            <Button
              onClick={() => handleExternalPayment(method)}
              disabled={
                processingPayment || paymentStatus?.status === "success" || paymentStatus?.status === "verified"
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {method.toUpperCase()} Апп нээх
            </Button>
            <Button
              onClick={verifyPayment}
              disabled={
                processingPayment || paymentStatus?.status === "success" || paymentStatus?.status === "verified"
              }
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Төлбөр шалгах
            </Button>
          </div>
        </div>
      )
    }

    // International cards (Visa, Mastercard, etc.)
    if (["visa", "mastercard", "unionpay"].includes(method)) {
      return (
        <div className="space-y-4">
          {renderPaymentStatus()}

          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h3 className="font-medium mb-4">Картаар төлөх</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Картын дугаар</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardInputChange}
                  disabled={paymentStatus?.status === "success" || paymentStatus?.status === "verified"}
                />
              </div>

              <div>
                <Label htmlFor="cardHolder">Карт эзэмшигчийн нэр</Label>
                <Input
                  id="cardHolder"
                  name="cardHolder"
                  placeholder="FIRSTNAME LASTNAME"
                  value={cardDetails.cardHolder}
                  onChange={handleCardInputChange}
                  disabled={paymentStatus?.status === "success" || paymentStatus?.status === "verified"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Хүчинтэй хугацаа</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleCardInputChange}
                    disabled={paymentStatus?.status === "success" || paymentStatus?.status === "verified"}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCardInputChange}
                    disabled={paymentStatus?.status === "success" || paymentStatus?.status === "verified"}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Дүн:</span>
                <span className="font-bold">{order.totalAmount.toLocaleString()}₮</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" className="mr-2" onClick={() => router.push("/cart")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Буцах
            </Button>
            <Button
              onClick={handleCardPayment}
              disabled={
                processingPayment || paymentStatus?.status === "success" || paymentStatus?.status === "verified"
              }
            >
              {processingPayment ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Боловсруулж байна...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Төлбөр хийх
                </>
              )}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="text-center">
        <p className="mb-4">Төлбөрийн хэлбэр олдсонгүй. Өөр төлбөрийн хэлбэр сонгоно уу.</p>
        <Button onClick={() => router.push("/cart")}>Сагс руу буцах</Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">Захиалга олдсонгүй</h1>
        <Button asChild className="mt-4">
          <a href="/">Нүүр хуудас руу буцах</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Төлбөр төлөх</h1>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Захиалгын мэдээлэл</CardTitle>
              <CardDescription>Захиалга #{orderId.slice(0, 6)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Захиалсан хичээлүүд:</h3>
                <ul className="mt-2 space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.title}</span>
                      <span>{item.price.toLocaleString()}₮</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Нийт дүн:</span>
                <span>{order.totalAmount.toLocaleString()}₮</span>
              </div>

              {order.referralCode && (
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    Урилгын код: <span className="font-medium">{order.referralCode}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Төлбөрийн мэдээлэл</CardTitle>
              <CardDescription>
                {order.paymentMethod === "qpay"
                  ? "QPay төлбөр"
                  : order.paymentMethod === "socialpay"
                    ? "SocialPay төлбөр"
                    : order.paymentMethod === "khanbank"
                      ? "Хаан Банк шилжүүлэг"
                      : order.paymentMethod === "golomtbank"
                        ? "Голомт Банк шилжүүлэг"
                        : order.paymentMethod === "visa"
                          ? "Visa карт"
                          : order.paymentMethod === "mastercard"
                            ? "Mastercard"
                            : "Төлбөр"}
              </CardDescription>
            </CardHeader>
            <CardContent>{renderPaymentMethod()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

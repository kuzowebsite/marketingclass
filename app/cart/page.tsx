"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ref, push, serverTimestamp, set, get, update } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { useCart } from "@/lib/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CartPage() {
  const { items, removeFromCart, clearCart, totalPrice } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<string>("qpay")
  const [loading, setLoading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const { db, user } = useFirebase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    // Check for referral code in URL
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [searchParams])

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Анхааруулга",
        description: "Худалдан авахын тулд нэвтэрнэ үү",
      })
      router.push("/auth/login")
      return
    }

    if (!db) {
      toast({
        title: "Алдаа",
        description: "Системд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Анхааруулга",
        description: "Таны сагс хоосон байна",
      })
      return
    }

    try {
      setLoading(true)

      // Create order in database
      const orderRef = ref(db, "orders")
      const newOrderRef = push(orderRef)
      const orderId = newOrderRef.key

      if (!orderId) {
        throw new Error("Failed to generate order ID")
      }

      // Clean items data - remove undefined values
      const cleanItems = items.map((item) => {
        // Create a clean copy without undefined values
        const cleanItem = { ...item }

        // Only add referralCode if it exists and is not empty
        if (referralCode) {
          cleanItem.referralCode = referralCode
        }

        return cleanItem
      })

      // Add referral code if exists
      const orderData = {
        id: orderId,
        userId: user.uid,
        items: cleanItems,
        totalAmount: totalPrice,
        status: "pending",
        paymentMethod,
        // Only add referralCode if it exists
        ...(referralCode ? { referralCode } : {}),
        createdAt: serverTimestamp(),
      }

      // Use set() function with the reference as first parameter
      await set(newOrderRef, orderData)

      // Immediately add purchased courses to user's account for testing
      // In a real app, this would happen after payment confirmation
      const userRef = ref(db, `users/${user.uid}`)
      const userSnapshot = await get(userRef)

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val()
        const currentPurchasedCourses = userData.purchasedCourses || []

        // Add new course IDs from this order
        const newCourseIds = items.map((item) => item.id)
        const updatedCourses = [...new Set([...currentPurchasedCourses, ...newCourseIds])]

        // Update user's purchased courses
        await update(userRef, { purchasedCourses: updatedCourses })
      }

      // Redirect to payment page
      router.push(`/payment/${orderId}`)

      // Clear cart after successful order
      clearCart()
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Алдаа",
        description: "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Төлбөрийн хэрэгслүүд
  const paymentOptions = {
    banks: [
      { id: "khanbank", name: "Хаан Банк", logo: "/payment/khanbank.png" },
      { id: "golomtbank", name: "Голомт Банк", logo: "/payment/golomtbank.png" },
      { id: "statebank", name: "Төрийн Банк", logo: "/payment/statebank.png" },
      { id: "tdbbank", name: "Худалдаа Хөгжлийн Банк", logo: "/payment/tdbbank.png" },
      { id: "xacbank", name: "Хас Банк", logo: "/payment/xacbank.png" },
    ],
    wallets: [
      { id: "qpay", name: "QPay", logo: "/payment/qpay.png" },
      { id: "socialpay", name: "SocialPay", logo: "/payment/socialpay.png" },
      { id: "monpay", name: "MonPay", logo: "/payment/monpay.png" },
      { id: "lendmn", name: "LendMN", logo: "/payment/lendmn.png" },
    ],
    international: [
      { id: "visa", name: "Visa", logo: "/payment/visa.png" },
      { id: "mastercard", name: "Mastercard", logo: "/payment/mastercard.png" },
      { id: "unionpay", name: "UnionPay", logo: "/payment/unionpay.png" },
    ],
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Таны сагс</h1>

      {items.length === 0 ? (
        <div className="mt-8 text-center py-12">
          <h2 className="text-xl font-medium">Таны сагс хоосон байна</h2>
          <Button asChild className="mt-4">
            <a href="/courses">Хичээлүүд үзэх</a>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Хичээлүүд ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.type === "organization" ? "Байгууллага" : "Хувь хүн"} / {item.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{item.price.toLocaleString()}₮</span>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {referralCode && (
              <Card className="mt-4 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    Урилгын код <span className="font-medium">{referralCode}</span> ашиглагдаж байна
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Төлбөрийн мэдээлэл</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Дүн</span>
                    <span>{totalPrice.toLocaleString()}₮</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Нийт дүн</span>
                    <span>{totalPrice.toLocaleString()}₮</span>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Төлбөрийн хэлбэр</h3>

                    <Tabs defaultValue="banks" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="banks">Банк</TabsTrigger>
                        <TabsTrigger value="wallets">Хэтэвч</TabsTrigger>
                        <TabsTrigger value="international">Карт</TabsTrigger>
                      </TabsList>

                      <TabsContent value="banks" className="mt-0">
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="grid grid-cols-2 gap-2"
                        >
                          {paymentOptions.banks.map((bank) => (
                            <div
                              key={bank.id}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                paymentMethod === bank.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                              }`}
                            >
                              <RadioGroupItem value={bank.id} id={bank.id} className="sr-only" />
                              <Label htmlFor={bank.id} className="flex flex-col items-center cursor-pointer">
                                <div className="h-10 w-full flex items-center justify-center mb-2">
                                  <div className="relative h-8 w-24">
                                    <img
                                      src={`/abstract-geometric-shapes.png?height=32&width=96&query=${bank.name} logo`}
                                      alt={bank.name}
                                      className="object-contain h-full w-full"
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-center">{bank.name}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </TabsContent>

                      <TabsContent value="wallets" className="mt-0">
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="grid grid-cols-2 gap-2"
                        >
                          {paymentOptions.wallets.map((wallet) => (
                            <div
                              key={wallet.id}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                paymentMethod === wallet.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                              }`}
                            >
                              <RadioGroupItem value={wallet.id} id={wallet.id} className="sr-only" />
                              <Label htmlFor={wallet.id} className="flex flex-col items-center cursor-pointer">
                                <div className="h-10 w-full flex items-center justify-center mb-2">
                                  <div className="relative h-8 w-24">
                                    <img
                                      src={`/abstract-geometric-shapes.png?height=32&width=96&query=${wallet.name} logo`}
                                      alt={wallet.name}
                                      className="object-contain h-full w-full"
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-center">{wallet.name}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </TabsContent>

                      <TabsContent value="international" className="mt-0">
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="grid grid-cols-2 gap-2"
                        >
                          {paymentOptions.international.map((card) => (
                            <div
                              key={card.id}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                paymentMethod === card.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                              }`}
                            >
                              <RadioGroupItem value={card.id} id={card.id} className="sr-only" />
                              <Label htmlFor={card.id} className="flex flex-col items-center cursor-pointer">
                                <div className="h-10 w-full flex items-center justify-center mb-2">
                                  <div className="relative h-8 w-24">
                                    <img
                                      src={`/abstract-geometric-shapes.png?height=32&width=96&query=${card.name} logo`}
                                      alt={card.name}
                                      className="object-contain h-full w-full"
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-center">{card.name}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleCheckout} disabled={loading || items.length === 0}>
                  {loading ? "Боловсруулж байна..." : "Худалдан авах"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

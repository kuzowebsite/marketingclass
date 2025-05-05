"use client"

import { useState, useEffect } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get } from "firebase/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Database, Users, BookOpen, ShoppingCart, Settings, Shield } from "lucide-react"

export default function DatabaseInfoPage() {
  const { db, user, loading } = useFirebase()
  const [dbData, setDbData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("users")

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      if (!loading && db && user) {
        try {
          // Check if user is admin
          const userRef = ref(db, `users/${user.uid}`)
          const userSnapshot = await get(userRef)

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val()
            if (!userData.isAdmin) {
              setIsAdmin(false)
              setIsLoading(false)
              return
            }
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
            setIsLoading(false)
            return
          }

          // Load database data
          const data: any = {}

          // Load users
          const usersRef = ref(db, "users")
          const usersSnapshot = await get(usersRef)
          if (usersSnapshot.exists()) {
            data.users = usersSnapshot.val()
          }

          // Load courses
          const coursesRef = ref(db, "courses")
          const coursesSnapshot = await get(coursesRef)
          if (coursesSnapshot.exists()) {
            data.courses = coursesSnapshot.val()
          }

          // Load orders
          const ordersRef = ref(db, "orders")
          const ordersSnapshot = await get(ordersRef)
          if (ordersSnapshot.exists()) {
            data.orders = ordersSnapshot.val()
          }

          // Load site settings
          const settingsRef = ref(db, "siteSettings")
          const settingsSnapshot = await get(settingsRef)
          if (settingsSnapshot.exists()) {
            data.siteSettings = settingsSnapshot.val()
          }

          setDbData(data)
          setIsLoading(false)
        } catch (error) {
          console.error("Error loading database data:", error)
          setIsLoading(false)
        }
      } else if (!loading && !user) {
        setIsAdmin(false)
        setIsLoading(false)
      }
    }

    checkAdminAndLoadData()
  }, [db, user, loading])

  const renderValue = (value: any, depth = 0): JSX.Element => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500">null</span>
    }

    if (typeof value === "string") {
      if (
        value.startsWith("http") &&
        (value.includes(".jpg") || value.includes(".png") || value.includes(".jpeg") || value.includes("data:image"))
      ) {
        return (
          <div>
            <img
              src={value || "/placeholder.svg"}
              alt="Image"
              className="max-w-xs max-h-32 object-contain rounded-md my-2"
            />
            <span className="text-xs text-gray-500 break-all">{value}</span>
          </div>
        )
      }
      return <span className="break-all">{value}</span>
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return <span>{String(value)}</span>
    }

    if (Array.isArray(value)) {
      return (
        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
          {value.map((item, index) => (
            <div key={index} className="mb-2">
              <span className="text-gray-500 mr-2">[{index}]:</span>
              {renderValue(item, depth + 1)}
            </div>
          ))}
        </div>
      )
    }

    if (typeof value === "object") {
      return (
        <div className={depth > 0 ? "pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2" : ""}>
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="mb-2">
              <span className="font-medium text-primary mr-2">{key}:</span>
              {renderValue(val, depth + 1)}
            </div>
          ))}
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  const getObjectCount = (obj: any): number => {
    if (!obj) return 0
    return Object.keys(obj).length
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Database className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-3xl font-bold">Өгөгдлийн сангийн мэдээлэл</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-red-500" />
              Хандах эрхгүй
            </CardTitle>
            <CardDescription>
              Та энэ хуудсанд хандах эрхгүй байна. Зөвхөн админ эрхтэй хэрэглэгчид энэ хуудсыг үзэх боломжтой.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.history.back()}>
              Буцах
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Database className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-3xl font-bold">Өгөгдлийн сангийн мэдээлэл</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Хэрэглэгчид</p>
                <p className="text-2xl font-bold">{getObjectCount(dbData.users)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Сургалтууд</p>
                <p className="text-2xl font-bold">{getObjectCount(dbData.courses)}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Захиалгууд</p>
                <p className="text-2xl font-bold">{getObjectCount(dbData.orders)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Тохиргоо</p>
                <p className="text-2xl font-bold">{dbData.siteSettings ? 1 : 0}</p>
              </div>
              <Settings className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Хэрэглэгчид
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Сургалтууд
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Захиалгууд
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Тохиргоо
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Хэрэглэгчид</CardTitle>
              <CardDescription>Нийт {getObjectCount(dbData.users)} хэрэглэгч</CardDescription>
            </CardHeader>
            <CardContent>
              {dbData.users ? (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(dbData.users).map(([userId, userData]: [string, any]) => (
                    <AccordionItem key={userId} value={userId}>
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="font-medium">{userData.displayName || "Нэргүй хэрэглэгч"}</span>
                          <span className="text-gray-500 text-sm ml-2">({userData.email})</span>
                          {userData.isAdmin && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            >
                              Админ
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">{renderValue(userData)}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center py-8 text-gray-500">Хэрэглэгчийн мэдээлэл олдсонгүй</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Сургалтууд</CardTitle>
              <CardDescription>Нийт {getObjectCount(dbData.courses)} сургалт</CardDescription>
            </CardHeader>
            <CardContent>
              {dbData.courses ? (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(dbData.courses).map(([courseId, courseData]: [string, any]) => (
                    <AccordionItem key={courseId} value={courseId}>
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="font-medium">{courseData.title || "Нэргүй сургалт"}</span>
                          <Badge
                            variant="outline"
                            className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {courseData.category || "Ангилалгүй"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">{renderValue(courseData)}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center py-8 text-gray-500">Сургалтын мэдээлэл олдсонгүй</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Захиалгууд</CardTitle>
              <CardDescription>Нийт {getObjectCount(dbData.orders)} захиалга</CardDescription>
            </CardHeader>
            <CardContent>
              {dbData.orders ? (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(dbData.orders).map(([orderId, orderData]: [string, any]) => (
                    <AccordionItem key={orderId} value={orderId}>
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="font-medium">Захиалга #{orderId.slice(0, 8)}</span>
                          <span className="text-gray-500 text-sm ml-2">
                            ({new Date(orderData.createdAt).toLocaleDateString()})
                          </span>
                          <Badge
                            variant="outline"
                            className={`ml-2 ${
                              orderData.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : orderData.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {orderData.status || "Төлөв тодорхойгүй"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">{renderValue(orderData)}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center py-8 text-gray-500">Захиалгын мэдээлэл олдсонгүй</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Сайтын тохиргоо</CardTitle>
              <CardDescription>Системийн үндсэн тохиргоо</CardDescription>
            </CardHeader>
            <CardContent>
              {dbData.siteSettings ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">{renderValue(dbData.siteSettings)}</div>
              ) : (
                <p className="text-center py-8 text-gray-500">Тохиргооны мэдээлэл олдсонгүй</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

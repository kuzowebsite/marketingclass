"use client"

import { useState } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import PaymentHistory from "@/components/payment-history"
import Link from "next/link"

export default function PaymentHistoryPage() {
  const { user } = useFirebase()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  if (!user) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Нэвтрээгүй байна</h1>
        <p className="mb-8">Төлбөрийн түүхийг харахын тулд нэвтэрнэ үү.</p>
        <Link href="/auth/login">
          <Button size="lg">Нэвтрэх</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Төлбөрийн түүх</h1>
          <p className="text-gray-500 dark:text-gray-400">Таны хийсэн бүх төлбөр, захиалгууд</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/courses">
            <Button variant="outline">Хичээлүүд харах</Button>
          </Link>
          <Link href="/profile">
            <Button>Профайл руу буцах</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">Бүгд</TabsTrigger>
          <TabsTrigger value="completed">Амжилттай</TabsTrigger>
          <TabsTrigger value="pending">Хүлээгдэж буй</TabsTrigger>
          <TabsTrigger value="failed">Амжилтгүй</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Захиалга хайх..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх статус</SelectItem>
                <SelectItem value="success">Амжилттай</SelectItem>
                <SelectItem value="verified">Баталгаажсан</SelectItem>
                <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
                <SelectItem value="processing">Боловсруулж буй</SelectItem>
                <SelectItem value="failed">Амжилтгүй</SelectItem>
                <SelectItem value="cancelled">Цуцлагдсан</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all">
          <PaymentHistory showViewAll={false} />
        </TabsContent>
        <TabsContent value="completed">
          <PaymentHistory showViewAll={false} />
        </TabsContent>
        <TabsContent value="pending">
          <PaymentHistory showViewAll={false} />
        </TabsContent>
        <TabsContent value="failed">
          <PaymentHistory showViewAll={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

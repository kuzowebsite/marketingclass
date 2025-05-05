"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NoteList } from "@/components/note-list"
import { BookOpen, Bookmark, Clock } from "lucide-react"

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<string>("all")
  const { user } = useFirebase()
  const router = useRouter()

  if (!user) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">Хандалт хаалттай</h1>
        <p className="mt-2 text-muted-foreground">Тэмдэглэлүүдийг харахын тулд нэвтэрнэ үү.</p>
        <Button asChild className="mt-4">
          <a href="/auth/login">Нэвтрэх</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Миний тэмдэглэлүүд</h1>
          <p className="text-muted-foreground mt-2">Хичээл үзэх явцад хөтөлсөн бүх тэмдэглэлүүд</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href="/courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Хичээлүүд үзэх
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Бүгд</TabsTrigger>
          <TabsTrigger value="bookmarked">
            <Bookmark className="h-4 w-4 mr-2" />
            Тэмдэглэсэн
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Сүүлийн үеийн
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Бүх тэмдэглэлүүд</CardTitle>
              <CardDescription>Таны хөтөлсөн бүх тэмдэглэлүүд</CardDescription>
            </CardHeader>
            <CardContent>
              <NoteList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Тэмдэглэсэн тэмдэглэлүүд</CardTitle>
              <CardDescription>Таны тэмдэглэсэн тэмдэглэлүүд</CardDescription>
            </CardHeader>
            <CardContent>
              <NoteList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Сүүлийн үеийн тэмдэглэлүүд</CardTitle>
              <CardDescription>Таны сүүлд хөтөлсөн тэмдэглэлүүд</CardDescription>
            </CardHeader>
            <CardContent>
              <NoteList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

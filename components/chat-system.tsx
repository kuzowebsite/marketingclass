"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ref, push, onValue, query, orderByChild, limitToLast, set } from "firebase/database"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import type { ChatMessage } from "@/lib/types"
import { Send } from "lucide-react"

interface ChatSystemProps {
  courseId: string
  lessonId: string
}

export function ChatSystem({ courseId, lessonId }: ChatSystemProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const { db, user } = useFirebase()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!db) return

    const chatRef = query(ref(db, `chats/${courseId}/${lessonId}`), orderByChild("createdAt"), limitToLast(50))

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messageList = Object.values(data) as ChatMessage[]
        setMessages(messageList.sort((a, b) => a.createdAt - b.createdAt))
      } else {
        setMessages([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [db, courseId, lessonId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!db || !user) {
      toast({
        title: "Анхааруулга",
        description: "Чатлахын тулд нэвтэрнэ үү",
      })
      return
    }

    if (!newMessage.trim()) return

    try {
      const chatRef = ref(db, `chats/${courseId}/${lessonId}`)
      const newChatRef = push(chatRef)

      const messageData: ChatMessage = {
        id: newChatRef.key!,
        userId: user.uid,
        userName: user.displayName || "Хэрэглэгч",
        courseId,
        lessonId,
        text: newMessage.trim(),
        createdAt: Date.now(),
      }

      await set(newChatRef, messageData)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Алдаа",
        description: "Мессеж илгээхэд алдаа гарлаа",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Асуулт & Хариулт</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Ачааллаж байна...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Асуулт & Хариулт</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Одоогоор асуулт байхгүй байна</p>
              <p className="text-sm text-muted-foreground mt-1">Хичээлтэй холбоотой асуултаа бичнэ үү</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.userId === user?.uid ? "justify-end" : ""}`}>
                {message.userId !== user?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    message.userId === user?.uid
                      ? "bg-primary text-primary-foreground"
                      : message.isAdmin
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted"
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-xs font-medium">
                      {message.userId === user?.uid ? "Та" : message.userName}
                      {message.isAdmin && " (Багш)"}
                    </p>
                    <p className="text-xs opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="mt-1">{message.text}</p>
                </div>
                {message.userId === user?.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.displayName ? getInitials(user.displayName) : "ХЭ"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Асуултаа бичнэ үү..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user}
          />
          <Button type="submit" size="icon" disabled={!user || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

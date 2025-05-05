"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, get, remove, update } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MoreHorizontal, Edit, Trash2, UserPlus, AlertTriangle, Users, UserCheck } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

export default function UsersPage() {
  const { db } = useFirebase()
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<"users" | "admins">("users")

  useEffect(() => {
    const fetchUsers = async () => {
      if (!db) return

      try {
        const usersRef = ref(db, "users")
        const snapshot = await get(usersRef)

        if (snapshot.exists()) {
          const usersData = snapshot.val()
          const usersArray = Object.keys(usersData).map((key) => ({
            id: key,
            ...usersData[key],
          }))
          setUsers(usersArray)
          setFilteredUsers(usersArray)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Алдаа гарлаа",
          description: "Хэрэглэгчдийн мэдээлэл авахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [db, toast])

  useEffect(() => {
    // Filter users based on search term, active tab, and section
    let filtered = users

    // Apply section filter first
    if (activeSection === "admins") {
      filtered = filtered.filter((user) => user.isAdmin)
    } else {
      // For regular users section, we might want to exclude admins
      // filtered = filtered.filter((user) => !user.isAdmin)
      // Or show all users in the users section
      filtered = [...users]
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeTab === "admin") {
      filtered = filtered.filter((user) => user.isAdmin)
    } else if (activeTab === "regular") {
      filtered = filtered.filter((user) => !user.isAdmin)
    } else if (activeTab === "active") {
      filtered = filtered.filter((user) => user.isActive)
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((user) => !user.isActive)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, activeTab, users, activeSection])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleDeleteUser = async () => {
    if (!db || !userToDelete) return

    setIsDeleting(true)

    try {
      // Delete user from database
      const userRef = ref(db, `users/${userToDelete.id}`)
      await remove(userRef)

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id))

      toast({
        title: "Амжилттай устгалаа",
        description: `${userToDelete.displayName || userToDelete.email || "Хэрэглэгч"} устгагдлаа.`,
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчийг устгахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const openDeleteDialog = (user: any) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!db) return

    setIsUpdatingStatus(userId)

    try {
      // Update user status in database
      const userRef = ref(db, `users/${userId}`)
      await update(userRef, {
        isActive: !currentStatus,
      })

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, isActive: !currentStatus } : user)),
      )

      toast({
        title: "Төлөв шинэчлэгдлээ",
        description: `Хэрэглэгчийн төлөв ${!currentStatus ? "идэвхтэй" : "идэвхгүй"} болгогдлоо.`,
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчийн төлөвийг шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Хэрэглэгчдийг ачааллаж байна...</p>
        </div>
      </div>
    )
  }

  const adminCount = users.filter((user) => user.isAdmin).length
  const regularUserCount = users.length - adminCount

  return (
    <div className="p-6">
      {/* Section Tabs */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Хэрэглэгчид</h2>
            <p className="text-muted-foreground">Нийт {users.length} хэрэглэгч бүртгэлтэй байна</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Шүүлтүүр
            </Button>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Хэрэглэгч нэмэх
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 border-b pb-4">
          <Button
            variant={activeSection === "users" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveSection("users")}
          >
            <Users className="h-4 w-4" />
            <span>Бүх хэрэглэгчид</span>
            <Badge variant="secondary" className="ml-1">
              {users.length}
            </Badge>
          </Button>
          <Button
            variant={activeSection === "admins" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveSection("admins")}
          >
            <UserCheck className="h-4 w-4" />
            <span>Админ хэрэглэгчид</span>
            <Badge variant="secondary" className="ml-1">
              {adminCount}
            </Badge>
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Хэрэглэгч хайх..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          </div>

          <Tabs defaultValue="all" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">Бүгд</TabsTrigger>
              {activeSection === "users" && (
                <>
                  <TabsTrigger value="admin">Админ</TabsTrigger>
                  <TabsTrigger value="regular">Энгийн</TabsTrigger>
                </>
              )}
              <TabsTrigger value="active">Идэвхтэй</TabsTrigger>
              <TabsTrigger value="inactive">Идэвхгүй</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <UsersTable
                users={filteredUsers}
                onDeleteUser={openDeleteDialog}
                onToggleStatus={handleToggleUserStatus}
                isUpdatingStatus={isUpdatingStatus}
              />
            </TabsContent>
            <TabsContent value="admin" className="mt-4">
              <UsersTable
                users={filteredUsers}
                onDeleteUser={openDeleteDialog}
                onToggleStatus={handleToggleUserStatus}
                isUpdatingStatus={isUpdatingStatus}
              />
            </TabsContent>
            <TabsContent value="regular" className="mt-4">
              <UsersTable
                users={filteredUsers}
                onDeleteUser={openDeleteDialog}
                onToggleStatus={handleToggleUserStatus}
                isUpdatingStatus={isUpdatingStatus}
              />
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              <UsersTable
                users={filteredUsers}
                onDeleteUser={openDeleteDialog}
                onToggleStatus={handleToggleUserStatus}
                isUpdatingStatus={isUpdatingStatus}
              />
            </TabsContent>
            <TabsContent value="inactive" className="mt-4">
              <UsersTable
                users={filteredUsers}
                onDeleteUser={openDeleteDialog}
                onToggleStatus={handleToggleUserStatus}
                isUpdatingStatus={isUpdatingStatus}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Хэрэглэгчийг устгах</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex items-start space-x-3 text-left">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-2">
                    {userToDelete?.displayName || userToDelete?.email || "Энэ хэрэглэгч"}-ийг устгахдаа итгэлтэй байна
                    уу?
                  </p>
                  <p>Энэ үйлдлийг буцаах боломжгүй. Хэрэглэгчийн бүх мэдээлэл устах болно.</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Устгаж байна...
                </>
              ) : (
                "Устгах"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface UsersTableProps {
  users: any[]
  onDeleteUser: (user: any) => void
  onToggleStatus: (userId: string, currentStatus: boolean) => void
  isUpdatingStatus: string | null
}

function UsersTable({ users, onDeleteUser, onToggleStatus, isUpdatingStatus }: UsersTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Хэрэглэгч</TableHead>
              <TableHead>Имэйл</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Идэвхтэй эсэх</TableHead>
              <TableHead>Бүртгүүлсэн огноо</TableHead>
              <TableHead className="text-right">Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Хэрэглэгч олдсонгүй
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.profileImageBase64 || user.photoURL || ""}
                          alt={user.displayName || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.displayName
                            ? user.displayName.charAt(0).toUpperCase()
                            : user.email
                              ? user.email.charAt(0).toUpperCase()
                              : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName || "Нэргүй хэрэглэгч"}</p>
                        {user.isAdmin && <p className="text-xs text-muted-foreground">Админ</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email || "Имэйл хаяг байхгүй"}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.isActive || false}
                        onCheckedChange={() => onToggleStatus(user.id, user.isActive || false)}
                        disabled={isUpdatingStatus === user.id}
                      />
                      {isUpdatingStatus === user.id && (
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("mn-MN") : "Тодорхойгүй"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Цэс нээх</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Засах
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => onDeleteUser(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Устгах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

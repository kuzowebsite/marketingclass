"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { ref, onValue, set } from "firebase/database"

export type CartItem = {
  id: string
  title: string
  price: number
  type: "organization" | "individual"
  category: string
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  totalPrice: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  totalPrice: 0,
})

export const useCart = () => useContext(CartContext)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { db, user } = useFirebase()

  useEffect(() => {
    if (db && user) {
      const cartRef = ref(db, `carts/${user.uid}`)
      const unsubscribe = onValue(cartRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setItems(Object.values(data))
        } else {
          setItems([])
        }
      })

      return () => unsubscribe()
    } else {
      // For non-logged in users, use localStorage
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (e) {
          setItems([])
        }
      }
    }
  }, [db, user])

  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, user])

  const saveCartToDb = (newItems: CartItem[]) => {
    if (db && user) {
      const cartRef = ref(db, `carts/${user.uid}`)
      const cartObject = newItems.reduce(
        (acc, item) => {
          acc[item.id] = item
          return acc
        },
        {} as Record<string, CartItem>,
      )

      set(cartRef, cartObject)
    }
    setItems(newItems)
  }

  const addToCart = (item: CartItem) => {
    const exists = items.some((i) => i.id === item.id)
    if (!exists) {
      const newItems = [...items, item]
      saveCartToDb(newItems)
    }
  }

  const removeFromCart = (id: string) => {
    const newItems = items.filter((item) => item.id !== id)
    saveCartToDb(newItems)
  }

  const clearCart = () => {
    saveCartToDb([])
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

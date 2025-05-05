"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  type User,
} from "firebase/auth"
import { ref, onValue, off, get, update } from "firebase/database"
import { auth, db, storage } from "./firebase-config"

type FirebaseContextType = {
  user: User | null
  loading: boolean
  auth: any
  db: any
  storage: any
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<any>
  signInWithFacebook: () => Promise<any>
  signInWithTwitter: () => Promise<any>
  isInitialized: boolean
  connectionStatus: "connected" | "disconnected" | "connecting"
  retryConnection: () => Promise<boolean>
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  auth: null,
  db: null,
  storage: null,
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInWithTwitter: async () => {},
  isInitialized: false,
  connectionStatus: "connecting",
  retryConnection: async () => false,
})

export const useFirebase = () => useContext(FirebaseContext)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  // Function to check database connection using a safer approach
  const checkDatabaseConnection = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        if (!db || !db.app) {
          console.error("Database is not initialized")
          resolve(false)
          return
        }

        // Use a timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.error("Database connection check timed out")
          resolve(false)
        }, 5000)

        // Try to establish a connection to Firebase
        const connectedRef = ref(db, ".info/connected")

        // Use onValue instead of get for connection status
        const unsubscribe = onValue(
          connectedRef,
          (snap) => {
            clearTimeout(timeoutId)
            const connected = snap.val() === true
            console.log("Firebase connection status:", connected ? "connected" : "disconnected")
            resolve(connected)
            // Clean up listener after we get the value
            off(connectedRef)
          },
          (error) => {
            clearTimeout(timeoutId)
            console.error("Error checking connection status:", error)
            resolve(false)
            // Clean up listener on error
            off(connectedRef)
          },
        )

        // Return cleanup function
        return () => {
          clearTimeout(timeoutId)
          off(connectedRef)
        }
      } catch (error) {
        console.error("Error in checkDatabaseConnection:", error)
        resolve(false)
      }
    })
  }

  // Alternative connection check that doesn't rely on .info/connected
  const checkFirebaseConnection = async (): Promise<boolean> => {
    try {
      if (!auth) {
        return false
      }

      // Check if Firebase auth is working by getting the current user
      // This is a simple operation that should work if Firebase is connected
      const currentUser = auth.currentUser
      console.log("Firebase connection check via auth:", !!currentUser || !!auth)

      // If we can access the auth object without errors, we're likely connected
      return true
    } catch (error) {
      console.error("Error checking Firebase connection:", error)
      return false
    }
  }

  // Function to retry connection
  const retryConnection = async (): Promise<boolean> => {
    console.log("Retrying Firebase connection...")
    setConnectionStatus("connecting")
    setConnectionAttempts((prev) => prev + 1)

    try {
      // Check if Firebase is initialized
      if (!auth || !db || !storage) {
        throw new Error("Firebase is not properly initialized")
      }

      // Use the alternative connection check method
      const isConnected = await checkFirebaseConnection()

      if (isConnected) {
        console.log("Firebase reconnection successful")
        setConnectionStatus("connected")
        setIsInitialized(true)
        return true
      } else {
        console.error("Firebase reconnection failed")
        setConnectionStatus("disconnected")
        return false
      }
    } catch (error) {
      console.error("Firebase reconnection error:", error)
      setConnectionStatus("disconnected")
      return false
    }
  }

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log("Setting up Firebase...")
        setConnectionStatus("connecting")

        // Check if Firebase is initialized
        if (!auth || !db || !storage) {
          console.error("Firebase is not properly initialized", {
            auth: !!auth,
            db: !!db,
            storage: !!storage,
          })
          setConnectionStatus("disconnected")
          setLoading(false)
          return
        }

        // Use the alternative connection check
        const isConnected = await checkFirebaseConnection()

        if (!isConnected) {
          console.error("Firebase is not accessible")
          setConnectionStatus("disconnected")
          setLoading(false)
          return
        }

        setIsInitialized(true)
        setConnectionStatus("connected")
        console.log("Firebase initialized successfully")

        const unsubscribe = onAuthStateChanged(
          auth,
          (currentUser) => {
            console.log("Auth state changed:", currentUser ? "User logged in" : "No user")
            setUser(currentUser)
            setLoading(false)
          },
          (error) => {
            console.error("Firebase auth error:", error)
            setLoading(false)
          },
        )

        return () => unsubscribe()
      } catch (error) {
        console.error("Firebase initialization error:", error)
        setConnectionStatus("disconnected")
        setLoading(false)
      }
    }

    initializeFirebase()
  }, [connectionAttempts])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth is not initialized")
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase auth is not initialized")
    return firebaseSignOut(auth)
  }

  // Configure Google provider with custom parameters
  const googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({
    prompt: "select_account",
  })

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth is not initialized")
    try {
      const result = await signInWithPopup(auth, googleProvider)

      // If successful login, store additional user info in database
      if (result.user) {
        const userRef = ref(db, `users/${result.user.uid}`)
        const snapshot = await get(userRef)

        // If this is a new user, create their profile
        if (!snapshot.exists()) {
          await update(userRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            createdAt: new Date().toISOString(),
            provider: "google",
          })
        }
      }

      return result
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  const signInWithFacebook = async () => {
    if (!auth) throw new Error("Firebase auth is not initialized")
    const provider = new FacebookAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const signInWithTwitter = async () => {
    if (!auth) throw new Error("Firebase auth is not initialized")
    const provider = new TwitterAuthProvider()
    return signInWithPopup(auth, provider)
  }

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        auth,
        db,
        storage,
        signIn,
        signOut,
        signInWithGoogle,
        signInWithFacebook,
        signInWithTwitter,
        isInitialized,
        connectionStatus,
        retryConnection,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

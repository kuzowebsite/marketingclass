// Firebase configuration
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getDatabase, type Database } from "firebase/database"
import { getAuth, type Auth } from "firebase/auth"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBU_jaYTDTkSPvtbbNG3VI-4QxCWRphlNQ",
  authDomain: "marketingclass-4240f.firebaseapp.com",
  databaseURL: "https://marketingclass-4240f-default-rtdb.firebaseio.com",
  projectId: "marketingclass-4240f",
  storageBucket: "marketingclass-4240f.appspot.com",
  messagingSenderId: "396770753928",
  appId: "1:396770753928:web:c1fc74a552f69c76e88e3d",
  measurementId: "G-685W607HZL",
}

// Improved Firebase initialization with better error handling and proper typing
let app: FirebaseApp | null = null
let db: Database | null = null
let auth: Auth | null = null
let storage: FirebaseStorage | null = null

try {
  // Initialize Firebase only if it hasn't been initialized already
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

  // Initialize services with error handling
  try {
    db = getDatabase(app)
    console.log("Firebase Database initialized")
  } catch (dbError) {
    console.error("Error initializing Firebase Database:", dbError)
    db = null
  }

  try {
    auth = getAuth(app)
    console.log("Firebase Auth initialized")
  } catch (authError) {
    console.error("Error initializing Firebase Auth:", authError)
    auth = null
  }

  try {
    storage = getStorage(app)
    console.log("Firebase Storage initialized")
  } catch (storageError) {
    console.error("Error initializing Firebase Storage:", storageError)
    storage = null
  }

  console.log("Firebase initialization completed")
} catch (error) {
  console.error("Error initializing Firebase app:", error)
  app = null
  db = null
  auth = null
  storage = null
}

// Create a connection status utility
const getConnectionStatus = () => {
  return {
    app: !!app,
    db: !!db,
    auth: !!auth,
    storage: !!storage,
    isFullyConnected: !!app && !!db && !!auth && !!storage,
  }
}

export { app, db, auth, storage, firebaseConfig, getConnectionStatus }

"use client"

import { useState } from "react"
import { useFirebase } from "@/lib/firebase/firebase-provider"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function FirebaseConnectionStatus() {
  const { connectionStatus, retryConnection, isInitialized } = useFirebase()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    await retryConnection()
    setIsRetrying(false)
  }

  if (connectionStatus === "connected" && isInitialized) {
    return null // Don't show anything when connected successfully
  }

  return (
    <Alert variant={connectionStatus === "connecting" ? "default" : "destructive"} className="mb-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        {connectionStatus === "connecting" ? (
          <RefreshCw className="h-5 w-5 animate-spin" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
        <AlertTitle>
          {connectionStatus === "connecting" ? "Firebase холболт хийгдэж байна..." : "Firebase холболт амжилтгүй"}
        </AlertTitle>
      </div>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          {connectionStatus === "connecting"
            ? "Түр хүлээнэ үү..."
            : "Одоогоор жишээ өгөгдөл ашиглаж байна. Бүх өөрчлөлтүүд зөвхөн энэ хуудсанд хадгалагдана, өгөгдлийн санд хадгалагдахгүй."}
        </p>
        {connectionStatus === "disconnected" && (
          <Button variant="outline" size="sm" onClick={handleRetry} disabled={isRetrying} className="mt-2">
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Холбож байна...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Дахин холбох
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

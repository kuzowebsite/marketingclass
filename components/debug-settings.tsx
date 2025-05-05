"use client"

import { useSiteSettings } from "@/lib/site-settings"
import { useEffect } from "react"

export function DebugSettings() {
  const { settings, loading, error } = useSiteSettings()

  useEffect(() => {
    console.log("Debug Settings Component:")
    console.log("Loading:", loading)
    console.log("Error:", error)
    console.log("Settings:", settings)
    console.log("Logo URL:", settings.logoUrl)
  }, [settings, loading, error])

  // Энэ компонент нь зөвхөн консол дээр мэдээлэл харуулах зорилготой
  return null
}

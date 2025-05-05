export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export const isDocument = (base64String: string | null): boolean => {
  if (!base64String) return false

  const dataPrefix = base64String.substring(0, 100) // Check the first 100 characters

  // Common prefixes for PDF and other document types
  return (
    dataPrefix.startsWith("data:application/pdf;") ||
    dataPrefix.startsWith("data:application/msword;") ||
    dataPrefix.startsWith("data:application/vnd.openxmlformats-officedocument") ||
    dataPrefix.startsWith("data:text/")
  )
}

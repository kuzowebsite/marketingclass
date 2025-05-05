import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, type UploadTaskSnapshot } from "firebase/storage"
import { app } from "./firebase-config"

const storage = getStorage(app)

export type UploadProgressCallback = (progress: number) => void

/**
 * Uploads a file to Firebase Storage and returns the download URL
 * @param file The file to upload
 * @param path The storage path where the file will be stored
 * @param onProgress Optional callback for upload progress updates
 * @returns Promise with the download URL
 */
export const uploadFile = async (file: File, path: string, onProgress?: UploadProgressCallback): Promise<string> => {
  try {
    // Create a storage reference
    const fileRef = storageRef(storage, path)

    // Create upload task
    const uploadTask = uploadBytes(fileRef, file)

    // Handle progress if callback provided
    if (onProgress) {
      uploadTask.then((snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress(progress)
      })
    }

    // Wait for upload to complete
    const snapshot = await uploadTask

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

/**
 * Generates a unique file path for storage
 * @param file The file to upload
 * @param folder The folder to store the file in
 * @returns A unique path string
 */
export const generateFilePath = (file: File, folder: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")

  return `${folder}/${timestamp}-${randomString}-${safeFileName}`
}

/**
 * Uploads an image file with proper validation
 * @param file The image file to upload
 * @param folder The folder to store the image in
 * @param onProgress Optional callback for upload progress updates
 * @returns Promise with the download URL
 */
export const uploadImage = async (
  file: File,
  folder = "images",
  onProgress?: UploadProgressCallback,
): Promise<string> => {
  // Validate file is an image
  if (!file.type.startsWith("image/")) {
    throw new Error("Зөвхөн зураг оруулах боломжтой")
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Зургийн хэмжээ 5MB-с хэтрэхгүй байх ёстой")
  }

  const path = generateFilePath(file, folder)
  return uploadFile(file, path, onProgress)
}

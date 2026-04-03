import path from "path"
import { promises as fs } from "fs"

export async function uploadImage(
  file: File,
  folder: string = "users"
): Promise<string | null> {

  if (!file || file.size === 0) return null

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid image type. Only JPG, PNG, WEBP allowed.")
  }

  // Validate file size (10MB)
  const MAX_SIZE = 10 * 1024 * 1024

  if (file.size > MAX_SIZE) {
    throw new Error("Image must be less than 5MB")
  }

  // Generate unique filename
  const ext = file.name.split(".").pop()

  const fileName = `${folder}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`

  // Upload directory
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    folder
  )

  await fs.mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, fileName)

  // Convert to buffer
  const arrayBuffer = await file.arrayBuffer()

  await fs.writeFile(filePath, Buffer.from(arrayBuffer))

  // Return public URL
  return `/uploads/${folder}/${fileName}`
}
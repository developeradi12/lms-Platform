import path from "path"
import { promises as fs } from "fs"
import { access } from "fs/promises"

export async function deleteFile(fileUrl: string) {
  try {
    if (!fileUrl) return

    //  Only allow uploads folder
    if (!fileUrl.startsWith("/uploads/")) return

    //  remove leading "/"
    const cleanUrl = fileUrl.slice(1) // "uploads/lessons/xyz.pdf"

    const filePath = path.join(process.cwd(), "public", cleanUrl)

    //  check if file exists
    try {
      await access(filePath)
      await fs.unlink(filePath)
    } catch {
      console.warn("File already deleted or not found:", fileUrl)
    }
  } catch (err) {
    console.warn("Delete failed:", fileUrl)
  }
}
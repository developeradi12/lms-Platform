import path from "path"
import { promises as fs } from "fs"

export async function deleteLocalImage(imageUrl: string) {
  try {
    if (!imageUrl) return;

    // example: /uploads/users/abc.jpg
    const filePath = path.join(process.cwd(), "public", imageUrl);

    await fs.unlink(filePath);
  } catch (error: any) {
    // ignore if file doesn't exist
    if (error.code !== "ENOENT") {
      console.error("Delete image error:", error);
    }
  }
}
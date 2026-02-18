import path from "path"
import fs from "fs/promises"

interface SavePublicUploadOptions {
  folder?: string;
  maxSize?: number;
}
export async function savePublicUpload(file: File, options?: SavePublicUploadOptions) {
  const { folder = "uploads", maxSize } = options || {};

  if (maxSize && file.size > maxSize) {
    throw new Error(`File size exceeds the limit of ${maxSize / 1024 / 1024}MB`);
  }
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "");
  const fileName = `${Date.now()}-${safeName}`;

  const uploadDir = path.join(process.cwd(), "public", folder)
  await fs.mkdir(uploadDir, { recursive: true })

  await fs.writeFile(path.join(uploadDir, fileName), buffer)

  return `/${folder}/${fileName}`;
}

export async function deletePublicFile(filePath: string) {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);

    await fs.unlink(fullPath);
  } catch (error) {
    console.log("File delete error (maybe already removed):", error);
  }
}
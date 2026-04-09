import path from "path"
import { promises as fs } from "fs";

export async function uploadFile(file: File, folder = "lessons") {
  if (!file || file.size === 0) return null;

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PDF/DOC allowed");
  }

  const MAX_SIZE = 10 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    throw new Error("File must be less than 10MB");
  }

  const ext = file.name.split(".").pop();

  const fileName = `${folder}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);

  return `/uploads/${folder}/${fileName}`;
}
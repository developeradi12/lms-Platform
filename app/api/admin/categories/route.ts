import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Category from "@/models/Category"
import path from "path";
import fs from "fs/promises";

export async function GET() {
  try {
    await connectDb()

    const categories = await Category.find().sort({ createdAt: -1 })

    return NextResponse.json(
      { success: true, categories },
      { status: 200 }
    )
  } catch (error) {
    console.log("GET CATEGORIES ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await connectDb()

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDescription = formData.get("metaDescription") as string;
    const imageFile = formData.get("image") as File

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      )
    }
    // const exists = await Category.findOne({ name })

    // if (exists) {
    //   return NextResponse.json(
    //     { message: "Category exists" },
    //     { status: 409 }
    //   )
    // }

    let imageUrl = "";
    if (imageFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image must be under 2MB" },
        { status: 400 }
      );
    }
     console.log("Thumbnail received:", imageFile.name);
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const fileName = `${Date.now()}-${imageFile.name}`

      const uploadDir = path.join(
        process.cwd(),
        "public/uploads"
      )

      await fs.mkdir(uploadDir, { recursive: true })

      await fs.writeFile(
        path.join(uploadDir, fileName),
        buffer
      )

      imageUrl = `/uploads/${fileName}`
    }


    const category = await Category.create({
     name,
      description,
      metaTitle,
      metaDescription,
      image: imageUrl,
    })

    return NextResponse.json(
      { success: true, message: "Category created successfully", data: category },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("CREATE CATEGORY ERROR:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}

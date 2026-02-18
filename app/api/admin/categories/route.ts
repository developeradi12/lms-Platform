import { NextRequest, NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Category from "@/models/Category"
// import path from "path";
// import fs from "fs/promises";
import { createCategoryApiSchema } from "@/schemas/categorySchema"
import { savePublicUpload } from "@/lib/uploadFile"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    await connectDb()
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const page = Number(req.nextUrl.searchParams.get("page") || "1")
    const limit = Number(req.nextUrl.searchParams.get("limit") || "10")
    const search = req.nextUrl.searchParams.get("search") || ""
    const sort = req.nextUrl.searchParams.get("sort") || "latest"
    const filter = search
      ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
          { metaTitle: { $regex: search, $options: "i" } },
        ],
      }
      : {}
    let sortQuery: any = { createdAt: -1 }

    if (sort === "oldest") sortQuery = { createdAt: 1 }
    if (sort === "name_asc") sortQuery = { name: 1 }
    if (sort === "name_desc") sortQuery = { name: -1 }
    const total = await Category.countDocuments(filter)

    const categories = await Category.find(filter)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
    return NextResponse.json(
      { success: true, categories, total, page, limit },
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
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData();
    const validatedText = createCategoryApiSchema
      .omit({ image: true })
      .parse({
        name: (formData.get("name") as string)?.trim(),
        description: (formData.get("description") as string) || "",
        metaTitle: (formData.get("metaTitle") as string) || "",
        metaDescription: (formData.get("metaDescription") as string) || "",
      })

    let imageUrl = ""
    const imageFile = formData.get("image") as File | null

    if (imageFile) {
      imageUrl = await savePublicUpload(imageFile, {
        folder: "categories",
        maxSize: 2 * 1024 * 1024,
      })
    }
    const exists = await Category.findOne({ name: validatedText.name })
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }
    const finalPayload = createCategoryApiSchema.parse({
      ...validatedText,
      image: imageUrl,
    })

    // 4️ Create category
    const category = await Category.create({
      ...finalPayload,
    });

    return NextResponse.json(
      { success: true, message: "Category created successfully", data: category },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("CREATE CATEGORY ERROR:", error)
    // Validation errors from schema
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: error.errors },
        { status: 400 }
      );
    }
    // Duplicate key error
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}

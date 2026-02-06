import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Category from "@/models/Category"
import slugify from "slugify"


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

    const body = await req.json()
    const {
      name,
      description = "",
      image,
      metaTitle,
      metaDescription = "",
    } = body


    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { success: false, message: "Category image is required" },
        { status: 400 }
      )
    }

    if (!metaTitle?.trim()) {
      return NextResponse.json(
        { success: false, message: "Meta title is required" },
        { status: 400 }
      )
    }

    const slug = slugify(name, { lower: true, strict: true })

    const exists = await Category.findOne({
      $or: [{ name }, { slug }],
    })

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      )
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      metaTitle,
      metaDescription,
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

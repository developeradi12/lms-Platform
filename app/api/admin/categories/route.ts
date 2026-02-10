import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Category from "@/models/Category"
import slugify from "slugify"
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
    const imageFile = formData.get("image") as File | null;


    let imageUrl = "";

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      )
    }

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "Category image is required" },
        { status: 400 }
      )
    }

    const slug = slugify(name, { lower: true, strict: true });

    const exists = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }

    if (imageFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image must be under 2MB" },
        { status: 400 }
      );
    }

      const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${imageFile.name}`;

    const uploadDir = path.join(process.cwd(), "public/uploads");

    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    // path to store in DB
    imageUrl = `/uploads/${fileName}`;

    

    const category = await Category.create({
      name,
      slug,
      description,
      image: imageUrl,
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

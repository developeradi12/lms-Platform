import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Category from "@/models/Category"
import path from "path"
import fs from "fs/promises";

type Params = {
    params: {
        id: string,
        slug: string,
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDb()

        const slug = await params;
        console.log("delete id", slug);

        const deletedCategory = await Category.findOneAndDelete(slug)

        if (!deletedCategory) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: true, message: "Category deleted successfully" },
            { status: 200 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDb()
        const slug = await params
        console.log("category slug",slug);
        const category = await Category.findOne(slug)
        console.log("category", category);
        if (!category) {
            return NextResponse.json(
                { message: "Not found" },
                { status: 404 }
            )
        }

        const formData = await req.formData()

        const name = formData.get("name") as string
        const description = formData.get("description") as string
        const metaTitle = formData.get("metaTitle") as string
        const metaDescription = formData.get("metaDescription") as string
        const imageFile = formData.get("image") as File | null
        const newSlug = formData.get("slug")as string
        let imageUrl = category.image

        // replace image
        if (imageFile && imageFile.size > 0) {

            // delete old image
            if (category.image) {
                const oldPath = path.join(
                    process.cwd(),
                    "public",
                    category.image
                )

                fs.unlink(oldPath).catch(() => { })
            }

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

        const updatedCategory = await Category.findOneAndUpdate(slug,
            {
                name,
                description,
                metaTitle,
                metaDescription,
                image: imageUrl,
                slug:newSlug
            },
            { new: true })

        return NextResponse.json(
            { success: true, message: "Category updated successfully", data: updatedCategory },
            { status: 200 }
        )
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}//working

export async function PATCH(req: Request, { params }: Params) {
    try {
        await connectDb();

        const slug = params;
        const body = await req.json()

        const updated = await Category.findByIdAndUpdate(slug, body, {
            new: true,
            runValidators: true,
        })

        if (!updated) {
            return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, message: "Category patched", data: updated })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDb();

        const slug = await params;
        console.log(slug);
        const category = await Category.findOne(slug)

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: true, category },
            { status: 200 }
        )
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}//working
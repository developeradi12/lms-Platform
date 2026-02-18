import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Category from "@/models/Category"
import { deletePublicFile, savePublicUpload } from "@/lib/uploadFile";
import { cookies } from "next/headers";


export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDb()
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

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

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDb()
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params

        const category = await Category.findOne({ slug })
        if (!category) {
            return NextResponse.json({ message: "Not found" }, { status: 404 })
        }

        const formData = await req.formData()

        const name = String(formData.get("name") || "").trim()
        const description = String(formData.get("description") || "")
        const metaTitle = String(formData.get("metaTitle") || "")
        const metaDescription = String(formData.get("metaDescription") || "")

        const imageFile = formData.get("image") as File | null

        const updatePayload: any = {
            name,
            description,
            metaTitle,
            metaDescription,
        }
        let imageUrl = category.image;
        // ✅ only update image if new uploaded
        if (imageFile) {
            if (category.image) {
                await deletePublicFile(category.image.replace(/^\/+/, ""));
            }
            imageUrl = await savePublicUpload(imageFile, {
                folder: "categories",
                maxSize: 2 * 1024 * 1024,
            })
            updatePayload.image = imageUrl
        }

        const updatedCategory = await Category.findOneAndUpdate(
            { slug },
            updatePayload,
            { new: true }
        )

        return NextResponse.json(
            {
                success: true,
                message: "Category updated successfully",
                data: updatedCategory,
            },
            { status: 200 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        )
    }
}//working

// export async function PATCH(req: Request, { params }: Params) {
//     try {
//         await connectDb();

//         const slug = params;
//         const body = await req.json()

//         const updated = await Category.findByIdAndUpdate(slug, body, {
//             new: true,
//             runValidators: true,
//         })

//         if (!updated) {
//             return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 })
//         }
//         return NextResponse.json({ success: true, message: "Category patched", data: updated })
//     } catch (error: any) {
//         return NextResponse.json({ success: false, message: error.message }, { status: 500 })
//     }
// }

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDb();
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

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
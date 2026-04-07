import { NextRequest, NextResponse } from "next/server"

import { uploadImage } from "@/utils/uploadImage";
import { deleteLocalImage } from "@/utils/deleteImage";
import connectDb from "@/lib/db";
import { getSession } from "@/utils/session";
import { Blog } from "@/models/Blog";


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDb();
        // console.log("DB connected");
        const { slug } = await params;
        // console.log("slug", slug);
        const blog: any = await Blog.findOne({ slug }).lean();

        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json({
            data: {
                ...blog,
                _id: blog._id.toString(),
            },
        });

    } catch (error) {
        console.error("Error fetching blog:", error);
        return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
    }
}
function parseJsonField(value: FormDataEntryValue | null): any[] {
    if (!value || typeof value !== "string") return []
    try {
        const parsed = JSON.parse(value) as unknown
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getSession()
        if (session?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDb()
        const { slug } = await params

        const formData = await request.formData()

        const newSlug = formData.get("slug") as string
        const imageFile = formData.get("featured_image") as File | null

        //  Check duplicate slug only if it changed
        if (newSlug && newSlug !== slug) {
            const existingBlog = await Blog.findOne({ slug: newSlug })
            if (existingBlog) {
                return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
            }
        }

        //  Only upload new image if a file was actually sent
        let featured_image: string | undefined

        const imageField = formData.get("featured_image")

        if (imageField instanceof File && imageField.size > 0) {
            // New file uploaded — save it
            try {
                const uploadedPath = await uploadImage(imageField, "blogs")
                if (!uploadedPath) throw new Error("Upload returned null")
                featured_image = uploadedPath
            } catch (uploadErr: any) {
                return NextResponse.json(
                    { error: uploadErr.message || "Image upload failed" },
                    { status: 400 }
                )
            }
        } else if (typeof imageField === "string" && imageField.startsWith("/uploads")) {
            // Existing URL passed from frontend — keep as is
            featured_image = imageField
        }

        const categories = parseJsonField(formData.get("categories"))
        const tags = parseJsonField(formData.get("tags"))

        const updateData: any = {
            title: formData.get("title"),
            slug: newSlug,
            excerpt: formData.get("excerpt"),
            content: formData.get("content"),
            author: formData.get("author"),
            categories: categories.map((c: any) => typeof c === "string" ? { value: c } : c),
            tags: tags.map((t: any) => typeof t === "string" ? { value: t } : t),
            is_published: formData.get("is_published") !== "false",
            published_at: formData.get("published_at") ? new Date(formData.get("published_at") as string) : new Date(),
            meta_title: (formData.get("meta_title") as string) || "",
            meta_description: (formData.get("meta_description") as string) || "",
        }

        //  Only overwrite image if a new one was uploaded
        if (featured_image) {
            updateData.featured_image = featured_image
        }

        const blog: any = await Blog.findOneAndUpdate({ slug }, updateData, { new: true }).lean()

        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 })
        }

        return NextResponse.json({
            message: "Blog updated successfully",
            data: { ...blog, _id: blog._id.toString() },
        })

    } catch (error) {
        console.error("Error updating blog:", error)
        return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getSession()

        if (session?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await connectDb()

        const { slug } = await params

        const blog = await Blog.findOneAndDelete({ slug })

        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 })
        }

        //  Delete image from /public/uploads after blog is removed from DB
        if (blog.featured_image) {
            await deleteLocalImage(blog.featured_image)
        }

        return NextResponse.json({ message: "Blog deleted successfully" })

    } catch (error) {
        console.error("Error deleting blog:", error)
        return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
    }
}
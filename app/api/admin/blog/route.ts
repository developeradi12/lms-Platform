import { NextResponse } from "next/server";
import { uploadImage } from "@/utils/uploadImage";
import connectDb from "@/lib/db";
import { getSession } from "@/utils/session";
import { Blog } from "@/models/Blog";



export async function GET(request: Request) {
    try {
    
        await connectDb()

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const page = parseInt(searchParams.get("page") || "1");
        const search = searchParams.get("search") || ""; // 1. Search param pakdein
        const skip = (page - 1) * limit;

        // 2. Search Query banayein
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: "i" } }, // 'i' matlab case-insensitive
                    { author: { $regex: search, $options: "i" } },
                    { slug: { $regex: search, $options: "i" } },
                ],
            };
        }

        // 3. Query ko search ke saath chalayein
        const [blogs, total] = await Promise.all([
            Blog.find(query) // <-- Query filter yahan pass karein
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Blog.countDocuments(query), // <-- Count bhi search ke hisaab se hoga
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            blogs: blogs.map((blog: any) => ({
                ...blog,
                _id: blog._id.toString(),
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages, // <-- Yahan check karein, ye variable upar define hona chahiye
            },
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json(
            { error: "Failed to fetch blogs" },
            { status: 500 },
        );
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
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (session?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDb()

    // ✅ formData instead of json — needed for file upload
    const formData = await request.formData()

    const title         = formData.get("title") as string
    const slug          = formData.get("slug") as string
    const content       = formData.get("content") as string
    const excerpt       = formData.get("excerpt") as string
    const author        = formData.get("author") as string
    const imageFile     = formData.get("featured_image") as File | null

    // ✅ Validate required fields
    const missingFields = []
    if (!title)   missingFields.push("title")
    if (!slug)    missingFields.push("slug")
    if (!content) missingFields.push("content")
    if (!excerpt) missingFields.push("excerpt")
    if (!author)  missingFields.push("author")
    if (!imageFile || imageFile.size === 0) missingFields.push("featured_image")

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    const existingBlog = await Blog.findOne({ slug })
    if (existingBlog) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // ✅ Upload image and get back the public URL path
    let featured_image: string
    try {
      const uploadedPath = await uploadImage(imageFile!, "blogs")
      if (!uploadedPath) throw new Error("Upload returned null")
      featured_image = uploadedPath
    } catch (uploadErr: any) {
      return NextResponse.json(
        { error: uploadErr.message || "Image upload failed" },
        { status: 400 }
      )
    }

    // Parse JSON fields sent as strings in formData
    const categories = parseJsonField(formData.get("categories"))
    const tags       = parseJsonField(formData.get("tags"))

    const blogData = {
      title,
      slug,
      excerpt,
      content,
      featured_image,                          // ✅ now a real path like /uploads/blogs/blogs_xxx.jpg
      author,
      categories: categories.map((c: any) => typeof c === "string" ? { value: c } : c),
      tags:       tags.map((t: any)       => typeof t === "string" ? { value: t } : t),
      is_published:    formData.get("is_published") !== "false",
      published_at:    formData.get("published_at") ? new Date(formData.get("published_at") as string) : new Date(),
      meta_title:      (formData.get("meta_title")       as string) || "",
      meta_description:(formData.get("meta_description") as string) || "",
    }

    const blog = new Blog(blogData)
    await blog.save()

    return NextResponse.json({
      message: "Blog created successfully",
      blog: { ...blog.toObject(), _id: blog._id.toString() },
    })

  } catch (error) {
    console.error("Error saving blog:", error)
    return NextResponse.json(
      { error: "Failed to save blog", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
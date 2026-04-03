
import connectDb from "@/lib/db";
import Testimonial from "@/models/testimonals";
import { uploadImage } from "@/utils/uploadImage";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/testimonials
export async function GET() {
  try {
    await connectDb();
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, testimonials });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST /api/admin/testimonials
export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const formData = await req.formData();
    const name      = formData.get("name")    as string;
    const role      = formData.get("role")    as string | null;
    const message   = formData.get("message") as string;
    const rating    = formData.get("rating")  as string | null;
    const imageFile = formData.get("image")   as File | null;

    if (!name?.trim())    return NextResponse.json({ success: false, message: "Name is required" },    { status: 400 });
    if (!message?.trim()) return NextResponse.json({ success: false, message: "Message is required" }, { status: 400 });

    let imagePath: string | undefined;
    if (imageFile && imageFile.size > 0) {
      imagePath = (await uploadImage(imageFile, "testimonials")) ?? undefined;
    }

    const testimonial = await Testimonial.create({
      name,
      role:    role    || undefined,
      message,
      rating:  rating  ? Number(rating) : undefined,
      image:   imagePath,
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
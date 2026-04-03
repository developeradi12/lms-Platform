import connectDb from "@/lib/db";
import Banner from "@/models/Banner";
import { uploadImage } from "@/utils/uploadImage";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/banner — fetch all banners
export async function GET() {
  try {
    await connectDb();
    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST /api/admin/banner — create new banner
export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const formData = await req.formData();

    const imageFile = formData.get("image") as File | null;
    const isMobileRaw = formData.get("isMobile");
    const isMobile = isMobileRaw === "true"; // convert to boolean
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { success: false, message: "Banner image is required" },
        { status: 400 }
      );
    }

    const imagePath = await uploadImage(imageFile, "banners");

    if (!imagePath) {
      return NextResponse.json(
        { success: false, message: "Image upload failed" },
        { status: 500 }
      );
    }

    const banner = await Banner.create({
      image: imagePath,
      isMobile,
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}
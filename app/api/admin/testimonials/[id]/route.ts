import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { uploadImage } from "@/utils/uploadImage";
import connectDb from "@/lib/db";
import Testimonial from "@/models/testimonals";

// PUT /api/admin/testimonials/[id]
export async function PUT(
  req: NextRequest,
  { params }:  { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
     const {id} = await params;
    const testimonial = await Testimonial.findById(id);
    if (!testimonial)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    const formData  = await req.formData();
    const name      = formData.get("name")    as string | null;
    const role      = formData.get("role")    as string | null;
    const message   = formData.get("message") as string | null;
    const rating    = formData.get("rating")  as string | null;
    const imageFile = formData.get("image")   as File | null;

    if (name)    testimonial.name    = name;
    if (message) testimonial.message = message;
    if (role    !== null) testimonial.role   = role    || undefined;
    if (rating  !== null) testimonial.rating = rating  ? Number(rating) : undefined;

    if (imageFile && imageFile.size > 0) {
      // Delete old image
      if (testimonial.image) {
        try {
          await fs.unlink(path.join(process.cwd(), "public", testimonial.image));
        } catch {}
      }
      const newPath = await uploadImage(imageFile, "testimonials");
      if (newPath) testimonial.image = newPath;
    }

    await testimonial.save();
    return NextResponse.json({ success: true, testimonial });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/testimonials/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
   const {id} = await params
    const testimonial = await Testimonial.findById(id);
    if (!testimonial)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (testimonial.image) {
      try {
        await fs.unlink(path.join(process.cwd(), "public", testimonial.image));
      } catch {}
    }

    await testimonial.deleteOne();
    return NextResponse.json({ success: true, message: "Testimonial deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import connectDb from "@/lib/db";
import Banner from "@/models/Banner";
import { deleteLocalImage } from "@/utils/deleteImage";


export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDb();
        const { id } = await params
        const banner = await Banner.findById(id);
        if (!banner) {
            return NextResponse.json(
                { success: false, message: "Banner not found" },
                { status: 404 }
            );
        }

        // Delete image file from public folder
        deleteLocalImage(banner.image);

        await banner.deleteOne();

        return NextResponse.json({ success: true, message: "Banner deleted" });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete banner" },
            { status: 500 }
        );
    }
}
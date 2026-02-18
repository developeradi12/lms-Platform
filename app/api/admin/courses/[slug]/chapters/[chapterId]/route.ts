import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDb from "@/lib/db"

import Chapter from "@/models/Chapter"
import Lesson from "@/models/Lesson"
import { cookies } from "next/headers"

type Params = {
    params: Promise<{ chapterId: string }>
}

//  PATCH: Update chapter
export async function PATCH(req: Request, { params }: Params) {
    try {
        await connectDb()
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { chapterId } = await params
        console.log("jeee", chapterId);
        const body = await req.json()

        const { title, description } = body

        const updated = await Chapter.findOneAndUpdate(
            { slug: chapterId },
            {
                ...(title !== undefined ? { title: title.trim() } : {}),
                ...(description !== undefined ? { description: description.trim() } : {}),
            },
            { new: true }
        )

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Chapter not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Chapter updated",
            chapter: updated,
        })
    } catch (error: any) {
        console.log(error);
        return NextResponse.json(
            { success: false, message: error.message || "Update failed" },
            { status: 500 }
        )
    }
}

//  DELETE: Delete chapter + delete all lessons inside it
export async function DELETE(req: Request, { params }: Params) {
    try {
        await connectDb()
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { chapterId } = await params

        const chapter = await Chapter.findOne({ slug: chapterId });
        if (!chapter) {
            return NextResponse.json(
                { success: false, message: "Chapter not found" },
                { status: 404 }
            );
        }
        // 1) delete all lessons of this chapter
        await Lesson.deleteMany({ chapter: chapter._id })

        // 2) delete chapter itself
        await Chapter.findByIdAndDelete(chapter._id);

        return NextResponse.json({
            success: true,
            message: "Chapter deleted (lessons also deleted)",
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Delete failed" },
            { status: 500 }
        )
    }
}

//  GET: Single Chapter
export async function GET(req: Request, { params }: Params) {
    try {
        await connectDb()
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { chapterId } = await params
        console.log("chapterid", chapterId);
        const slug = chapterId
        const chapter = await Chapter.findOne({ slug }).lean()

        if (!chapter) {
            return NextResponse.json(
                { success: false, message: "Chapter not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, chapter }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch chapter" },
            { status: 500 }
        )
    }
}
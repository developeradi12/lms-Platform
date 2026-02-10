import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDb from "@/lib/db"

import Chapter from "@/models/Chapter"
import Lesson from "@/models/Lesson"

type Params = {
    params: Promise<{ chapterId: string }>
}

//  PATCH: Update chapter
export async function PATCH(req: Request, { params }: Params) {
    try {
        await connectDb()

        const { chapterId } = await params
        console.log("jeee",chapterId);
        const body = await req.json()

        if (!mongoose.Types.ObjectId.isValid(chapterId)) {
            return NextResponse.json(
                { success: false, message: "Invalid chapterId" },
                { status: 400 }
            )
        }

        const { title, order } = body

        const updated = await Chapter.findByIdAndUpdate(
            chapterId,
            {
                ...(title !== undefined ? { title: title.trim() } : {}),
                ...(order !== undefined ? { order: Number(order) } : {}),
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

        const { chapterId } = await params

        if (!mongoose.Types.ObjectId.isValid(chapterId)) {
            return NextResponse.json(
                { success: false, message: "Invalid chapterId" },
                { status: 400 }
            )
        }

        // 1) delete all lessons of this chapter
        await Lesson.deleteMany({ chapter: chapterId })

        // 2) delete chapter itself
        const deleted = await Chapter.findByIdAndDelete(chapterId)

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Chapter not found" },
                { status: 404 }
            )
        }

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

    const { chapterId } = await params

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { success: false, message: "Invalid chapterId" },
        { status: 400 }
      )
    }

    const chapter = await Chapter.findById(chapterId).lean()

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
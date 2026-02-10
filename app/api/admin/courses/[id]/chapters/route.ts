import connectDb from "@/lib/db";
import Chapter from "@/models/Chapter";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import mongoose from "mongoose";
import { NextResponse } from "next/server";


type Params = {
    params: Promise<{ id: string }>
}

//get 

export async function GET(req: Request, { params }: Params) {
    try {
        await connectDb();
        const { id } = await params
        console.log("testing", id);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid courseId" },
                { status: 400 }
            )
        }

        const chapters = await Chapter.find({ course: id })
            .sort({ order: 1, createdAt: 1 })
            .lean()
            .populate("course", "title")

        const chaptersWithCount = await Promise.all(
            chapters.map(async (ch) => {
                const lessonsCount = await Lesson.countDocuments({ chapter: ch._id })
                return { ...ch, lessonsCount }
            })
        )
        return NextResponse.json({ success: true, chapters: chaptersWithCount })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch chapters" },
            { status: 500 }
        )
    }
}


//POST

export async function POST(req: Request, { params }: Params) {
    try {
        await connectDb()

        const { id } = await params
        const body = await req.json()

        const { title, description } = body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid courseid" },
                { status: 400 }
            )
        }

        if (!title?.trim()) {
            return NextResponse.json(
                { success: false, message: "Title is required" },
                { status: 400 }
            )
        }
        let finalOrder: number
        const lastChapter = await Chapter.findOne({ course: id })
            .sort({ order: -1 })
            .select("order")

        finalOrder = (lastChapter?.order ?? 0) + 1


        const chapter = await Chapter.create({
            title: title.trim(),
            course: id,
            description:description,
            order: finalOrder,
        })
        await Course.findByIdAndUpdate(id, {
            $push: { chapters: chapter._id },
        })

        return NextResponse.json(
            { success: true, message: "Chapter created", chapter },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create chapter" },
            { status: 500 }
        )
    }
}
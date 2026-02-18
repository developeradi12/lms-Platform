import connectDb from "@/lib/db";
import Chapter from "@/models/Chapter";
import { Course } from "@/models/Course";
import Lesson from "@/models/Lesson";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

//get 
export async function GET(req: Request,
    { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDb();
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params
        console.log("testing", slug);

        const course = await Course.findOne({ slug });
        if (!course) {
            return NextResponse.json(
                { success: false, message: "Course not found" },
                { status: 404 }
            );
        }

        const chapters = await Chapter.find({ course: course._id })
            .sort({ order: 1, createdAt: 1 })
            .lean();

        const chaptersWithCount = await Promise.all(
            chapters.map(async (ch) => {
                const lessonsCount = await Lesson.countDocuments({ chapter: ch._id })
                return { ...ch, lessonsCount }
            })
        )
        return NextResponse.json({ success: true, chapters: chaptersWithCount })
    } catch (error: any) {
        console.log("get error", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch chapters" },
            { status: 500 }
        )
    }
}


//POST

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDb()
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("accessToken")?.value

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { slug } = await params
        const body = await req.json()

        const { title, description } = body

        if (!title?.trim()) {
            return NextResponse.json(
                { success: false, message: "Title is required" },
                { status: 400 }
            )
        }
        const course = await Course.findOne({ slug });
        if (!course) {
            return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
        }
        let finalOrder: number
        const lastChapter = await Chapter.findOne({ course: course._id })
            .sort({ order: -1 })
            .select("order")

        finalOrder = (lastChapter?.order ?? 0) + 1


        const chapter = await Chapter.create({
            title: title.trim(),
            course: course._id,
            description: description,
            order: finalOrder,
        })
        await Course.findOneAndUpdate({ slug },
            { $push: { chapters: chapter._id } }
        );

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
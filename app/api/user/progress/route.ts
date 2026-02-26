import connectDb from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import Chapter from "@/models/Chapter";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const cookieStore = await cookies()
    const token = cookieStore.get("accessToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let userId: string

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as { userId: string }

      userId = decoded.userId
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { lessonId, watchedSeconds } =
      await req.json();

    const lesson = await Lesson.findById(lessonId).populate({
      path: "chapter",
      populate: {
        path: "course",
      },
    })
    if (!lesson || !lesson.chapter) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    const courseId = lesson.chapter.course


    // 2️⃣ Check enrollment
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      status: "ACTIVE",
    })
    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in course" },
        { status: 403 }
      )
    }

    // 3️⃣ Calculate completion threshold (85%)
    const threshold = lesson.duration * 60 * 0.98 // if duration in minutes
    const isCompleted = watchedSeconds >= threshold

    // 4️⃣ Update progress
    await Progress.findOneAndUpdate(
      { user: userId, lesson: lessonId },
      {
        user: userId,
        lesson: lessonId,
        course: courseId,
        watchedSeconds,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      { upsert: true, new: true }
    )
    // Count total lesson
    const chapters = await Chapter.find({ course: courseId }).select("_id")
    const chapterIds = chapters.map(ch => ch._id)

    const totalLessons = await Lesson.countDocuments({
      chapter: { $in: chapterIds },
    })

    const completedLessons = await Progress.countDocuments({
      user: userId,
      course: courseId,
      isCompleted: true,
    })

    const percentage = Math.round(
      (completedLessons / totalLessons) * 100
    )

    // 6️⃣ Update enrollment progress
    await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      { progress: percentage }
    )

    return NextResponse.json({
      success: true,
      lessonCompleted: isCompleted,
      courseProgress: percentage,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
/* Creates progress if not exists
 Updates watchedSeconds
  Marks lesson complete
 Recalculates course %
 Updates Enrollment */
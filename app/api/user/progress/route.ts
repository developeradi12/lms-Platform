import connectDb from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import { NextRequest, NextResponse } from "next/server";
import Chapter from "@/models/Chapter";
import { getSession } from "@/utils/session";

export async function POST(req: NextRequest) {
  try {
    await connectDb()
    const session = await getSession()

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { courseId, lessonId, isCompleted } = body;

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { success: false, message: "CourseId and LessonId required" },
        { status: 400 }
      );
    }
    const enrollment = await Enrollment.findOne({
      user: session.userId,
      course: courseId,
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "User not enrolled in this course" },
        { status: 403 }
      );
    }

    // 🔍 Find existing progress
    let progress = await Progress.findOne({
      user: session.userId,
      course: courseId,
    });

    // 🆕 Create progress if not exists
    if (!progress) {
      progress = await Progress.create({
        user: session.userId,
        course: courseId,
        completedLessons: [],
      });
    }
    enrollment.progress = progress._id;
    await enrollment.save();

    // ✅ Update lesson progress
    progress.lastAccessedLesson = lessonId;

    if (isCompleted) {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
    }
    const chapters = await Chapter.find({ course: courseId })
    // 📊 Calculate percentage
    const totalLessons = chapters.reduce(
      (acc, chapter) => acc + chapter.lessons.length,
      0
    )
    const completedCount = progress.completedLessons.length;

    let percentage = 0

    if (totalLessons > 0) {
      percentage = Math.round((completedCount / totalLessons) * 100)
    }

    progress.percentage = Math.min(100, percentage)
    
    // 🎓 Mark course completed
    if (progress.percentage === 100) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      message: "Progress updated",
      data: progress,
    });
  } catch (error) {

    console.error("------ Progress API ERROR ------")
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
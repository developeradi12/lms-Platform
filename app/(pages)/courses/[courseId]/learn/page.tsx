import { Course } from "@/models/Course";
import LearnClient from "./LearnClient"
import connectDb from "@/lib/db";
import Progress from "@/models/Progress";
import { getAuthUser } from "@/lib/getAuthUser";
import "@/models/Lesson"
import "@/models/Chapter"

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  await connectDb();
  const { courseId } = await params;
  const res = await getAuthUser();

  const courseData:any = await Course.findOne({ slug: courseId })
    .populate({
      path: "chapters",
      populate: { path: "lessons" }
    })
    .lean()
    
  if (!courseData) {
    throw new Error("Course not found")
  }
  // console.log("courseData", courseData);

  //  Get Progress Using REAL course _id
  const progress = await Progress.find({
    user: res._id,
    course: courseData._id,
  }).lean()
// console.log("pregres",progress);
  const completedLessonIds = progress.map(p =>
    p.lesson.toString()
  )

  const courseWithProgress = {
    ...courseData,
    chapters: courseData.chapters.map((ch: any) => ({
      ...ch,
      lessons: ch.lessons.map((l: any) => ({
        ...l,
        isCompleted: completedLessonIds.includes(
          l._id.toString()
        ),
      })),
    })),
  }


  // Convert MongoDB IDs to strings for the Client Component
  const sanitizedCourse = JSON.parse(JSON.stringify(courseWithProgress));

  return <LearnClient course={sanitizedCourse} />;
}

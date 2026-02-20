import { Course } from "@/models/Course";
import LearnClient from "./LearnClient"
import connectDb from "@/lib/db";


export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  await connectDb();
  const { courseId } = await params;

  const courseData = await Course.findOne({ slug: courseId })
    .populate({
      path: "chapters",
      populate: { path: "lessons" }
    })
    .lean();

  // Convert MongoDB IDs to strings for the Client Component
  const sanitizedCourse = JSON.parse(JSON.stringify(courseData));

  return <LearnClient course={sanitizedCourse} />;
}

import connectDb from "@/lib/db"
import Category from "@/models/Category";
import { Course } from "@/models/Course";
import { notFound } from "next/navigation";
import EditCourseForm from "./EditCourseForm";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  await connectDb();
  const { slug } = await params;
  const course = await Course.findOne({ slug })
    .populate("categories")
    .lean();
 
  if (!course) notFound()
  const categories = await Category.find().lean()

  return (
    <EditCourseForm
      course={JSON.parse(JSON.stringify(course))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  )
}


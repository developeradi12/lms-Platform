import EnrollButton from "@/components/EnrollButton";
import { notFound } from "next/navigation";

type Props = {
  params: {
    courseId: string;
  };
};

export default async function CourseDetails({ params }: Props) {
  const { courseId } = await params;

  if (!courseId) return notFound();

  const course = {
    title: courseId.replaceAll("-", " "),
    price: 499,
  } ;
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-6">
        {course.title}
      </h1>

      <p className="mb-8 text-gray-600">
        Learn everything from scratch.
      </p>

      <EnrollButton />
    </div>
  );
}


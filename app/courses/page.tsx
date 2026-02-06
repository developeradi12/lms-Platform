import Link from "next/link";

const courses = [
  {
    id: 1,
    title: "React for Beginners",
    slug: "react-for-beginners",
  },
  {
    id: 2,
    title: "System Design",
    slug: "system-design",
  },
];

export default function CoursesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-10">All Courses</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.slug}`}
            className="p-6 rounded-2xl border hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">
              {course.title}
            </h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

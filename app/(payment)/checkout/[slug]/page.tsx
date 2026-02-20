import connectDb from "@/lib/db"
import { Course } from "@/models/Course"
import { notFound, redirect } from "next/navigation"
import CheckoutForm from "../../_component/checkoutForm"
import { CourseDocument } from "@/schemas/courseSchema"

interface Props {
    params: Promise<{ slug: string }>
}


export default async function CheckoutPage({ params }: Props) {
    await connectDb()
    const {slug} = await params
    const course = await Course.findOne({slug})
    .populate("instructor", "name email")
    .lean<CourseDocument>()
    if (!course) return notFound()

    if (course.price === 0) {
        redirect(`/courses/${course.slug}`)
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <CheckoutForm course={JSON.parse(JSON.stringify(course))} />
        </div>
    )
}

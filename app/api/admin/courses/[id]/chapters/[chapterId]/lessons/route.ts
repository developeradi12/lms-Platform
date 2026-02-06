// import { NextResponse } from "next/server"
// import connectDb from "@/lib/db"
// import Course from "@/models/Course"

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string; chapterId: string }> }
// ) {
//   try {
//     await connectDb()
//     const { id, chapterId } = await params

//     const body = await req.json()
//     const { title, videoUrl, duration, isFreePreview } = body

//     if (!title?.trim()) {
//       return NextResponse.json(
//         { success: false, message: "Lesson title is required" },
//         { status: 400 }
//       )
//     }

//     const course = await Course.findById(id)

//     if (!course) {
//       return NextResponse.json(
//         { success: false, message: "Course not found" },
//         { status: 404 }
//       )
//     }

//     const chapter = course.chapters.id(chapterId)

//     if (!chapter) {
//       return NextResponse.json(
//         { success: false, message: "Chapter not found" },
//         { status: 404 }
//       )
//     }

//     chapter.lessons.push({
//       title,
//       videoUrl: videoUrl || "",
//       duration: duration || 0,
//       isFreePreview: !!isFreePreview,
//     })

//     await course.save()

//     return NextResponse.json(
//       { success: true, message: "Lesson added", course },
//       { status: 201 }
//     )
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     )
//   }
// }

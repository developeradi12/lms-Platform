// "use client"

// import React, { useEffect, useState } from "react"
// import axios from "axios"
// import { useParams, useRouter } from "next/navigation"
// import { toast } from "sonner"
// import { z } from "zod"
// import { useForm, type SubmitHandler } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Badge } from "@/components/ui/badge"

// import { Plus, RefreshCcw } from "lucide-react"

// type Lesson = {
//   _id: string
//   title: string
//   videoUrl?: string
//   duration?: number
//   isFreePreview?: boolean
// }

// type Chapter = {
//   _id: string
//   title: string
//   lessons: Lesson[]
// }

// type Course = {
//   _id: string
//   slug:string
//   title: string
//   description?: string
//   thumbnail?: string
//   price: number
//   duration?: number
//   chapters: Chapter[]
//   createdAt?: string
//   updatedAt?: string
// }

// const courseSchema = z.object({
//   title: z.string().min(2, "Title is required"),
//   description: z.string().optional(),
//   thumbnail: z.string().optional(),
//   price: z.coerce.number().min(0, "Price cannot be negative"),
//   duration: z.coerce.number().min(0, "Duration cannot be negative").optional(),
// })

// type CourseFormValues = z.input<typeof courseSchema>

// export default function EditCoursePage() {
//   const params = useParams()
//   const router = useRouter()
//   const {slug} = useParams();
//  console.log("course slug",slug);
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)

//   const [addingChapter, setAddingChapter] = useState(false)
//   const [addingLesson, setAddingLesson] = useState<string | null>(null)

//   const [course, setCourse] = useState<Course | null>(null)

//   const [chapterTitle, setChapterTitle] = useState("")
//   const [lessonTitle, setLessonTitle] = useState<Record<string, string>>({})

//   const form = useForm<CourseFormValues>({
//     resolver: zodResolver(courseSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       thumbnail: "",
//       price: 0,
//       duration: 0,
//     },
//     mode: "onChange",
//   })

//   const fetchCourse = async () => {
//     try {
//       setLoading(true)

//       const res = await axios.get(`/api/admin/courses/${slug}`)
//       const c = res.data?.course

//       if (!c) {
//         toast.error("Course not found")
//         // router.push("/admin/courses")
//         return
//       }

//       setCourse(c)

//       form.reset({
//         title: c.title || "",
//         description: c.description || "",
//         thumbnail: c.thumbnail || "",
//         price: c.price ?? 0,
//         duration: c.duration ?? 0,
//       })
//     } catch (error: any) {
//       toast.error(error?.response?.data?.message || "Failed to load course")
//       // router.push("/admin/courses")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (slug) fetchCourse()
//   }, [slug])


//  const onSubmit = async (values: CourseFormValues) => {
//     try {
//       setSaving(true)

//       await axios.put(`/api/admin/courses/${slug}`, values)

//       toast.success("Course updated successfully")
//       fetchCourse()
//     } catch (error: any) {
//       toast.error(error?.response?.data?.message || "Update failed")
//     } finally {
//       setSaving(false)
//     }
//   }
//   const addChapter = async () => {
//     if (!chapterTitle.trim()) return toast.error("Chapter title is required")

//     try {
//       setAddingChapter(true)

//       await axios.post(`/api/admin/courses/${slug}/chapters`, {
//         title: chapterTitle,
//       })

//       toast.success("Chapter added")
//       setChapterTitle("")
//       fetchCourse()
//     } catch (error: any) {
//       toast.error(error?.response?.data?.message || "Failed to add chapter")
//     } finally {
//       setAddingChapter(false)
//     }
//   }

//   const addLesson = async (chapterId: string) => {
//     const title = lessonTitle[chapterId] || ""
//     if (!title.trim()) return toast.error("Lesson title is required")

//     try {
//       setAddingLesson(chapterId)

//       await axios.post(`/api/admin/courses/${slug}/chapters/${chapterId}/lessons`, {
//         title,
//       })

//       toast.success("Lesson added")
//       setLessonTitle((prev) => ({ ...prev, [chapterId]: "" }))
//       fetchCourse()
//     } catch (error: any) {
//       toast.error(error?.response?.data?.message || "Failed to add lesson")
//     } finally {
//       setAddingLesson(null)
//     }
//   }
//   if (loading) {
//     return (
//       <div className="p-6 space-y-6">
//         <Skeleton className="h-8 w-64 rounded-xl" />
//         <Skeleton className="h-[240px] w-full rounded-2xl" />
//         <Skeleton className="h-[340px] w-full rounded-2xl" />
//       </div>
//     )
//   }

 
//   if (!course) {
//     return (
//       <div className="p-6 space-y-4 max-w-full">
//         <h1 className="text-xl font-semibold">Course not found</h1>
//         <p className="text-sm text-muted-foreground">
//           This course may have been deleted.
//         </p>
//         <Button
//           className="rounded-xl"
//           variant="outline"
//           onClick={() => router.push("/admin/courses")}
//         >
//           Back to Courses
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6 space-y-6 max-w-5xl">
    
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">Edit Course</h1>
//           <p className="text-sm text-muted-foreground">
//             Update course details, chapters and lessons.
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <Button
//             variant="outline"
//             className="rounded-xl"
//             onClick={() => fetchCourse()}
//           >
//             <RefreshCcw className="w-4 h-4 mr-2 bg-black" />
//             Refresh
//           </Button>

//           <Button
//             variant="outline"
//             className="rounded-xl"
//             onClick={() => router.push("/admin/courses")}
//           >
//             Back
//           </Button>
//         </div>
//       </div>

     
//       <Card className="rounded-2xl">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-base">Course Details</CardTitle>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               {/* Title */}
//               <div className="space-y-2">
//                 <Label>Title *</Label>
//                 <Input className="rounded-xl" {...form.register("title")} />
//                 {form.formState.errors.title && (
//                   <p className="text-sm text-red-500">
//                     {form.formState.errors.title.message}
//                   </p>
//                 )}
//               </div>

//               {/* Price */}
//               <div className="space-y-2">
//                 <Label>Price</Label>
//                 <Input
//                   type="number"
//                   className="rounded-xl"
//                   {...form.register("price")}
//                 />
//                 {form.formState.errors.price && (
//                   <p className="text-sm text-red-500">
//                     {form.formState.errors.price.message}
//                   </p>
//                 )}
//               </div>

//               {/* Duration */}
//               <div className="space-y-2">
//                 <Label>Duration (minutes)</Label>
//                 <Input
//                   type="number"
//                   className="rounded-xl"
//                   {...form.register("duration")}
//                 />
//                 {form.formState.errors.duration && (
//                   <p className="text-sm text-red-500">
//                     {form.formState.errors.duration.message}
//                   </p>
//                 )}
//               </div>

//               {/* Thumbnail */}
//               <div className="space-y-2">
//                 <Label>Thumbnail URL</Label>
//                 <Input className="rounded-xl" {...form.register("thumbnail")} />
//               </div>
//             </div>

//             {/* Thumbnail Preview */}
//             {form.watch("thumbnail")?.trim() ? (
//               <div className="overflow-hidden rounded-2xl border">
//                 <img
//                   src={form.watch("thumbnail")}
//                   alt="thumbnail preview"
//                   className="w-full h-52 object-cover"
//                 />
//               </div>
//             ) : null}

//             {/* Description */}
//             <div className="space-y-2">
//               <Label>Description</Label>
//               <Textarea
//                 className="rounded-xl min-h-[120px]"
//                 {...form.register("description")}
//               />
//             </div>

//             <Button
//               type="submit"
//               className="rounded-xl"
//               disabled={saving || !form.formState.isValid}
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>

//       {/* Chapters + Lessons */}
//       <Card className="rounded-2xl">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-base">Chapters & Lessons</CardTitle>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Add Chapter */}
//           <div className="flex flex-col sm:flex-row gap-3">
//             <Input
//               className="rounded-xl"
//               placeholder="New chapter title..."
//               value={chapterTitle}
//               onChange={(e) => setChapterTitle(e.target.value)}
//               disabled={addingChapter}
//             />

//             <Button
//               className="rounded-xl"
//               onClick={addChapter}
//               type="button"
//               disabled={addingChapter}
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               {addingChapter ? "Adding..." : "Add Chapter"}
//             </Button>
//           </div>

//           {/* Chapters List */}
//           <div className="space-y-5">
//             {course.chapters?.length === 0 ? (
//               <p className="text-sm text-muted-foreground">
//                 No chapters added yet.
//               </p>
//             ) : (
//               course.chapters.map((ch, index) => (
//                 <div key={ch._id} className="rounded-2xl border p-4 space-y-4">
//                   {/* Chapter Header */}
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <h3 className="font-medium">
//                         {index + 1}. {ch.title}
//                       </h3>
//                       <Badge variant="secondary" className="rounded-xl">
//                         {ch.lessons?.length || 0} lessons
//                       </Badge>
//                     </div>
//                   </div>

//                   {/* Lessons */}
//                   <div className="space-y-2">
//                     {ch.lessons?.length ? (
//                       ch.lessons.map((ls, i) => (
//                         <div
//                           key={ls._id}
//                           className="flex items-center justify-between rounded-xl border px-3 py-2"
//                         >
//                           <p className="text-sm">
//                             {i + 1}. {ls.title}
//                           </p>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-sm text-muted-foreground">
//                         No lessons yet.
//                       </p>
//                     )}
//                   </div>

//                   {/* Add Lesson */}
//                   <div className="flex flex-col sm:flex-row gap-3">
//                     <Input
//                       className="rounded-xl"
//                       placeholder="New lesson title..."
//                       value={lessonTitle[ch._id] || ""}
//                       onChange={(e) =>
//                         setLessonTitle((prev) => ({
//                           ...prev,
//                           [ch._id]: e.target.value,
//                         }))
//                       }
//                       disabled={addingLesson === ch._id}
//                     />

//                     <Button
//                       className="rounded-xl"
//                       type="button"
//                       onClick={() => addLesson(ch._id)}
//                       disabled={addingLesson === ch._id}
//                     >
//                       <Plus className="w-4 h-4 mr-2" />
//                       {addingLesson === ch._id ? "Adding..." : "Add Lesson"}
//                     </Button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

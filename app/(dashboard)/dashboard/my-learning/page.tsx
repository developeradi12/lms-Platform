"use client"

import { useEffect, useMemo, useState } from "react"
import api from "@/lib/api"
import Link from "next/link"
import Image from "next/image"

import {
    BookOpen,
    CheckCircle,
    Clock,
    Trophy,
    Filter,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { EnrollmentSerialized } from "@/types/enrollment"

export default function MyCoursesPage() {

    const [courses, setCourses] = useState<EnrollmentSerialized[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState("all")

    useEffect(() => {
        const fetchCourses = async () => {
            try {

                const res = await api.get("/api/user/enroll")
                // console.log("API RESPONSE:", res.data)
                if (res.data.success) {
                    setCourses(res.data.data)
                }

            } catch (error) {

                console.error("Error fetching courses:", error)

            } finally {

                setLoading(false)

            }
        }

        fetchCourses()
    }, [])

    /* ---------------- Filters ---------------- */

    const inProgress = useMemo(
        () => courses.filter((c) => !c.progress?.isCompleted),
        [courses]
    )

    const completed = useMemo(
        () => courses.filter((c) => c.progress?.isCompleted),
        [courses]
    )

    const filteredCourses = useMemo(() => {

        switch (tab) {
            case "in-progress":
                return inProgress

            case "completed":
                return completed

            default:
                return courses
        }

    }, [tab, courses, inProgress, completed])

    /* ---------------- Stats ---------------- */

    const totalHours = useMemo(() => {

        return Math.floor(
            courses.reduce(
                (acc, c) => acc + Number(c.course.duration || 0),
                0
            ) / 60
        )

    }, [courses])

    /* ---------------- UI ---------------- */


    return (
        <div className="flex flex-col gap-6 p-4">

            {/* HEADER */}

            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    My Learning
                </h2>

                <p className="text-muted-foreground">
                    Track your progress and continue where you left off
                </p>
            </div>


            {/* STATS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <Stat
                    icon={<BookOpen className="size-5" />}
                    label="Enrolled"
                    value={courses.length}
                />

                <Stat
                    icon={<CheckCircle className="size-5" />}
                    label="Completed"
                    value={completed.length}
                />

                <Stat
                    icon={<Clock className="size-5" />}
                    label="Total Hours"
                    value={`${totalHours}h`}
                />

                <Stat
                    icon={<Trophy className="size-5" />}
                    label="Certificates"
                    value={completed.length}
                />

            </div>


            {/* TABS */}

            <Tabs value={tab} onValueChange={setTab}>

                <TabsList className="bg-secondary">

                    <TabsTrigger value="all">
                        All ({courses.length})
                    </TabsTrigger>

                    <TabsTrigger value="in-progress">
                        In Progress ({inProgress.length})
                    </TabsTrigger>

                    <TabsTrigger value="completed">
                        Completed ({completed.length})
                    </TabsTrigger>

                </TabsList>


                <TabsContent value={tab} className="mt-4">

                    {loading ? (

                        <p className="text-muted-foreground">
                            Loading courses...
                        </p>

                    ) : filteredCourses.length === 0 ? (

                        <div className="flex flex-col items-center justify-center py-20 text-center">

                            <Filter className="size-12 text-muted-foreground/50 mb-4" />

                            <h3 className="text-lg font-semibold">
                                No courses here yet
                            </h3>

                            <Link href="/courses">
                                <Button className="mt-4">
                                    Browse Courses
                                </Button>
                            </Link>

                        </div>

                    ) : (

                        <div className="flex flex-col gap-4">

                            {filteredCourses.map((course) => {

                                const percent = course.progress?.percentage ?? 0;

                                return (

                                    <Link
                                        key={course._id}
                                        href={`/learn/${course.course.slug}`}
                                    >

                                        <Card className="border-border bg-card hover:shadow-md transition-all hover:-translate-y-1">

                                            <CardContent className="p-4 md:p-5">

                                                <div className="flex flex-col gap-4 md:flex-row md:items-center">


                                                    {/* Thumbnail */}

                                                    <div className="relative h-20 w-28 rounded-lg overflow-hidden shrink-0">

                                                        <Image
                                                            src={course.course.thumbnail}
                                                            alt={course.course.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="112px"
                                                        />

                                                    </div>


                                                    {/* Info */}

                                                    <div className="flex-1 min-w-0">

                                                        <h3 className="text-base font-semibold truncate">
                                                            {course.course.title}
                                                        </h3>

                                                        <p className="text-sm text-muted-foreground">

                                                            {course.course?.instructor?.name || "Unknown Instructor"}

                                                        </p>

                                                    </div>


                                                    {/* Progress */}

                                                    <div className="flex flex-col items-end gap-2 md:w-56 shrink-0">

                                                        <div className="flex items-center justify-between w-full text-sm">

                                                            <span className="text-muted-foreground">
                                                                Progress
                                                            </span>

                                                            <span className="font-semibold">
                                                                {percent}%
                                                            </span>

                                                        </div>


                                                        <Progress
                                                            value={percent}
                                                            className="h-2 w-full"
                                                        />


                                                        {percent < 100 ? (

                                                            <Button size="sm">
                                                                Continue
                                                            </Button>

                                                        ) : (

                                                            <Button size="sm" variant="outline">

                                                                <Trophy className="size-3 mr-1" />

                                                                Certificate

                                                            </Button>

                                                        )}

                                                    </div>

                                                </div>

                                            </CardContent>

                                        </Card>

                                    </Link>

                                )

                            })}

                        </div>

                    )}

                </TabsContent>

            </Tabs>

        </div>
    )
}



function Stat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string | number
}) {

    return (

        <Card className="border-border bg-card">

            <CardContent className="flex items-center gap-4 p-5">

                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">

                    {icon}

                </div>

                <div>

                    <p className="text-sm text-muted-foreground">
                        {label}
                    </p>

                    <p className="text-lg font-semibold">
                        {value}
                    </p>

                </div>

            </CardContent>

        </Card>

    )
}
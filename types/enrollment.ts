import { CourseDetailsSerialized } from "./course";
import { ProgressSerialized } from "./progress";

export type EnrollmentSerialized = {
    _id: string;
    course: CourseDetailsSerialized
    progress: ProgressSerialized;
    enrolledAt: string;
    status: "ACTIVE" | "COMPLETED" | "REFUNDED";
    createdAt: string;
    updatedAt: string;
}

export type Enrollments = {
    enrollmentId: string;
    courseId: string;
    title: string;
    slug: string;
    thumbnail: string;
    instructor: {
        _id: string;
        name?: string | undefined;
        bio: string;
    } | null;
    completedLesson: number;
    totalDuration: number;
    price: number;
    progress: number;
    status: "ACTIVE" | "COMPLETED" | "REFUNDED";
    enrolledAt: string;
    lastUpdated: string | null;
} 
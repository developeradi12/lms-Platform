import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import {Course} from "@/models/Course"
import path from "path";
import fs from "fs/promises";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"

export async function GET() {
    try {
        await connectDb()

        const courses = await Course.aggregate([
            {
                //$lookup is used inside Aggregation Pipeline to perform a JOIN between two collections
                //✅ Stage 1 — $lookup (Join Chapters) Joins chapters with each course.
                $lookup: {
                    from: "chapters",
                    localField: "_id",
                    foreignField: "course",
                    as: "chapters",
                },
            },
            {
                $addFields: {
                    chaptersCount: { $size: "$chapters" },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
                //it return like that "category": [ { "name": "Web Dev" } ]
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true  //If a course has NO category: Without it → course disappears
                }
            }, // it convert this category: [{ name: "Web Dev"}]   
            // into this category: { name: "Web Dev"}
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                },
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
        ])


        // const courses = await Course.find().populate("category").populate("instructor").sort({ createdAt: -1 }).lean()
        // const coursesWithCounts = await Promise.all(
        //     courses.map(async (course) => {
        //         const chaptersCount = await Chapter.countDocuments({ course: course._id })
        //         return { ...course, chaptersCount }
        //     })
        // )    //issue it does N queries so total queries 1+n it too slow 
        return NextResponse.json({ success: true, courses }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        await connectDb()

        const cookieStore = await cookies()
        const token = cookieStore.get("accessToken")?.value // 👈 apna cookie name check

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }
        const decoded: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!)
        const instructorId = decoded?.userId

        if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
            return NextResponse.json(
                { success: false, message: "Invalid instructor" },
                { status: 401 }
            )
        }


        const formData = await req.formData();

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const price = Number(formData.get("price"));
        const durationValue = formData.get("duration")
        const duration = durationValue ? Number(durationValue) : 0
        const isPublished = formData.get("isPublished") === "true";
        const thumbnailFile = formData.get("thumbnail") as File | null;
        let thumbnailPath = "";
        if (thumbnailFile) {
            // Example placeholder
            // thumbnailUrl = await uploadToCloudinary(thumbnailFile);
            if (thumbnailFile.size > 2 * 1024 * 1024) {
                return NextResponse.json(
                    { success: false, message: "Image must be under 2MB" },
                    { status: 400 }
                );
            }
            console.log("Thumbnail received:", thumbnailFile.name);

            const bytes = await thumbnailFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `${Date.now()}-${thumbnailFile.name}`;

            const uploadDir = path.join(process.cwd(), "public/uploads");

            await fs.mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, fileName);

            await fs.writeFile(filePath, buffer);

            // path to store in DB
            thumbnailPath = `/uploads/${fileName}`;
        }
        const course = await Course.create({
            title,
            description,
            category,
            price,
            duration,
            isPublished,
            thumbnail: thumbnailPath, // store URL, not file
            instructor: instructorId,
            chapters: [],
        });
        return NextResponse.json(
            { success: true, message: "Course created", course },
            { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Something went wrong" },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
// import { authMiddleware, adminMiddleware } from "@/lib/middleware"; 
// adjust path if needed

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // // 🔥 Protect route
    // const authUser = await authMiddleware(req);
    // adminMiddleware(authUser);

    // Query params
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Search filter
    // ✅ Always filter only STUDENTS
    const query: any = {
      role: "STUDENT",
    }
    console.log("")
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }
    // Fetch users
    const users = await User.find(query).lean()  //lean() improves performance by returning plain JS objects instead of heavy Mongoose documents.”
      .select("-password") //  never send password this remove the password and send the user 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    console.log(users);
    const totalStudents = await User.countDocuments(query);
    console.log(totalStudents);
    return NextResponse.json({
      users,
      totalStudents,
      limit,
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}



import connectDb from "@/lib/db";
import Submission from "@/models/Submission";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const submissions = await Submission.find()
      .populate("user", "name")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error: any) {
  console.error("GET SUBMISSION ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Submission from "@/models/Submission"
import { getSession } from "@/utils/session"
import mongoose from "mongoose"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()

    const user = await getSession()

   
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    //  validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      )
    }

    const submission = await Submission.findByIdAndDelete(id)

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Submission deleted",
    })

  } catch (error: any) {
    console.error("DELETE ERROR:", error)

    return NextResponse.json(
      { message: error.message || "Delete failed" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()

    const user = await getSession()

    //  admin check
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
console.log("PATCH BODY:", body);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID" },
        { status: 400 }
      )
    }

    const submission = await Submission.findById(id)

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      )
    }

    //  update status
    submission.status = body.status || "REVIEWED"

    await submission.save()

    return NextResponse.json({
      success: true,
      message: "Status updated",
      submission,
    })

  } catch (error: any) {
    console.error("PATCH ERROR:", error)

    return NextResponse.json(
      { message: error.message || "Update failed" },
      { status: 500 }
    )
  }
}
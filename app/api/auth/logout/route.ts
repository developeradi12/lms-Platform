import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDb();

    // cookie se refreshToken nikalna
    const refreshToken = req.headers
      .get("cookie")
      ?.split("; ")
      .find((row) => row.startsWith("refreshToken="))
      ?.split("=")[1];

    // DB se refreshToken remove (optional but best)
    if (refreshToken) {
      await User.updateOne({ refreshToken }, { $set: { refreshToken: "" } });
    }

    const res = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // cookies clear
    res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}

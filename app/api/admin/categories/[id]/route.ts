import { NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Category from "@/models/Category"

type Params = {
    params: {
        id: string,
        slug: string,
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb()

        const { id } = await params;
        console.log("delete id", id);

        const deletedCategory = await Category.findByIdAndDelete(id)

        if (!deletedCategory) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: true, message: "Category deleted successfully" },
            { status: 200 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb()

        const { id } = await params;
        const body = await req.json()

        const updatedCategory = await Category.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        })
        if (!updatedCategory) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { success: true, message: "Category updated successfully", data: updatedCategory },
            { status: 200 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}//working

export async function PATCH(req: Request, { params }: Params) {
    try {
        await connectDb();

        const { id } = params;
        const body = await req.json()

        const updated = await Category.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        })

        if (!updated) {
            return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, message: "Category patched", data: updated })
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();

        const { id } = await params;
        const category = await Category.findById(id)

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: true, category },
            { status: 200 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}//working
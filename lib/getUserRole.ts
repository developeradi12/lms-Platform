import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function getUserRole() {
    const cookieStore = await cookies() 
    const token = cookieStore.get("accessToken")?.value

    try {
        if (!token) return "user"

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            role?: string
        }

        return decoded?.role ?? "user"
    } catch {
        return "user"
    }
}

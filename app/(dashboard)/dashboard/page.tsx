 import { getAuthUser } from "@/lib/getAuthUser";
import { SiteHeader } from "../_components/site-header";
import DashboardContent from "./_componets/DashboardContent";
import { getUserEnrollments } from "@/lib/service/enrollment";

export default async function DashboardPage() {
   const user = await getAuthUser()
     const enrollments = await getUserEnrollments(user._id)

  return (
    <>
       <DashboardContent
        user={user}
        enrollments={enrollments}
      />
    </>
  )
}
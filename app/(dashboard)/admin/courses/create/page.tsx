import connectDb from "@/lib/db"
import CreateCourseForm from "./CreateCourseForm"
import Category from "@/models/Category";

export default async function Page() {
     
  await connectDb();
  const categories = await Category.find().lean();
  return <CreateCourseForm  categories={JSON.parse(JSON.stringify(categories))} />
}


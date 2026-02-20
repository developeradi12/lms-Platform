import { getAllCategories } from "../../../../../lib/service/category"
import CreateCourseForm from "./CreateCourseForm"

export default async function Page() {
  const categories = await getAllCategories()

  return <CreateCourseForm categories={categories} />
}


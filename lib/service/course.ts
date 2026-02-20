import Category from "@/models/Category"
import { Course } from "@/models/Course"

interface GetCoursesProps {
    search: string
    categories: string
    price: string
    skip: number
    limit: number
}

export async function getCourses({
    search, categories, price, limit, skip
}: GetCoursesProps) {

    const query: any = { isPublished: true }
    if (search) {
        query.title = { $regex: search, $options: "i" } // Case-insensitive search
    }
    if (categories && categories !== "all") {
        const slugs = Array.isArray(categories) ? categories : [categories]
        const categoryDocs = await Category.find({ slug: { $in: slugs } }).select("_id")
        const categoryIds = categoryDocs.map((cat) => cat._id)
        query.categories = { $in: categoryIds }
    }

    if (price === "free") query.price = 0
    if (price === "paid") query.price = { $gt: 0 }

    // Fetch total count and paginated courses in parallel
    const [total, courses] = await Promise.all([
        Course.countDocuments(query),
        Course.find(query)
            .populate("categories", "_id name slug") // Only required fields
            .populate("instructor", "_id name profileImage") // Only required fields
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean(),
    ])

    return { total, courses }
}

/*{Note}
 * $regex: search
        Regex ka matlab hai Regular Expression.
          Normal search mein agar aap "Javascript" dhundenge, toh wo exact match dhundega.
    $regex ke saath, agar user sirf "Java" likhega,toh bhi 
    use "Javascript" aur "Java for Beginners" dono mil jayenge. Yeh "pattern matching" karta hai.

  *  $options: "i" 
     Yahan "i" ka matlab hai In-sensitive (Case-insensitive).
    Iske bina: Agar database mein "Python" likha hai aur user ne "python" (small p) search kiya, toh kuch nahi milega.
"i" ke saath: User PYTHON, python, ya PyThOn kuch bhi likhe, result mil jayega.
*/
export type Course = {
  id: string
  title: string
  description: string
  instructor: string
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  lessons: number
  enrolled: number
  rating: number
  progress?: number
  image: string
  tags: string[]
}

export type Lesson = {
  id: string
  title: string
  duration: string
  type: "video" | "reading" | "quiz"
  completed: boolean
}

export type Module = {
  id: string
  title: string
  lessons: Lesson[]
}

export const categories = [
  "All",
  "Web Development",
  "Data Science",
  "Design",
  "Mobile Development",
  "Cloud Computing",
  "Machine Learning",
]

export const courses: Course[] = [
  {
    id: "1",
    title: "Modern React with Next.js",
    description:
      "Master React and Next.js by building real-world applications. Learn server components, routing, data fetching, and deployment strategies.",
    instructor: "Sarah Chen",
    category: "Web Development",
    level: "Intermediate",
    duration: "24h 30m",
    lessons: 48,
    enrolled: 3420,
    rating: 4.8,
    progress: 65,
    image: "/images/course-react.jpg",
    tags: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "2",
    title: "Python for Data Science",
    description:
      "Learn Python programming for data analysis, visualization, and machine learning. Work with pandas, numpy, and scikit-learn.",
    instructor: "Dr. James Miller",
    category: "Data Science",
    level: "Beginner",
    duration: "32h 15m",
    lessons: 64,
    enrolled: 5830,
    rating: 4.9,
    progress: 30,
    image: "/images/course-python.jpg",
    tags: ["Python", "Pandas", "ML"],
  },
  {
    id: "3",
    title: "UI/UX Design Fundamentals",
    description:
      "Learn the principles of user interface and user experience design. Create wireframes, prototypes, and polished design systems.",
    instructor: "Maria Rodriguez",
    category: "Design",
    level: "Beginner",
    duration: "18h 45m",
    lessons: 36,
    enrolled: 2150,
    rating: 4.7,
    progress: 100,
    image: "/images/course-design.jpg",
    tags: ["Figma", "UI Design", "UX"],
  },
  {
    id: "4",
    title: "Advanced TypeScript Patterns",
    description:
      "Deep dive into advanced TypeScript features including generics, conditional types, mapped types, and design patterns for large-scale apps.",
    instructor: "Alex Kowalski",
    category: "Web Development",
    level: "Advanced",
    duration: "16h 20m",
    lessons: 32,
    enrolled: 1890,
    rating: 4.6,
    image: "/images/course-typescript.jpg",
    tags: ["TypeScript", "Patterns", "Architecture"],
  },
  {
    id: "5",
    title: "Flutter Mobile Development",
    description:
      "Build beautiful, natively compiled mobile applications for iOS and Android from a single codebase using Flutter and Dart.",
    instructor: "Priya Sharma",
    category: "Mobile Development",
    level: "Intermediate",
    duration: "28h 10m",
    lessons: 56,
    enrolled: 2780,
    rating: 4.7,
    image: "/images/course-flutter.jpg",
    tags: ["Flutter", "Dart", "Mobile"],
  },
  {
    id: "6",
    title: "AWS Cloud Architecture",
    description:
      "Design and implement scalable cloud solutions on AWS. Cover EC2, S3, Lambda, DynamoDB, and best practices for cloud architecture.",
    instructor: "Michael Park",
    category: "Cloud Computing",
    level: "Advanced",
    duration: "36h 00m",
    lessons: 72,
    enrolled: 3100,
    rating: 4.8,
    image: "/images/course-aws.jpg",
    tags: ["AWS", "Cloud", "DevOps"],
  },
  {
    id: "7",
    title: "Deep Learning with TensorFlow",
    description:
      "Build neural networks and deep learning models using TensorFlow and Keras. Cover CNNs, RNNs, transformers, and practical applications.",
    instructor: "Dr. Lisa Wang",
    category: "Machine Learning",
    level: "Advanced",
    duration: "40h 30m",
    lessons: 80,
    enrolled: 4250,
    rating: 4.9,
    progress: 12,
    image: "/images/course-tensorflow.jpg",
    tags: ["TensorFlow", "Deep Learning", "Neural Networks"],
  },
  {
    id: "8",
    title: "Responsive Web Design",
    description:
      "Master CSS Grid, Flexbox, and responsive design techniques to build beautiful, mobile-first websites that look great on any device.",
    instructor: "Emma Taylor",
    category: "Design",
    level: "Beginner",
    duration: "14h 00m",
    lessons: 28,
    enrolled: 4600,
    rating: 4.5,
    image: "/images/course-css.jpg",
    tags: ["CSS", "Responsive", "HTML"],
  },
]

export const myCourses = courses.filter((c) => c.progress !== undefined)

export const courseModules: Module[] = [
  {
    id: "m1",
    title: "Getting Started",
    lessons: [
      { id: "l1", title: "Course Introduction", duration: "5m", type: "video", completed: true },
      { id: "l2", title: "Setting Up Your Environment", duration: "12m", type: "video", completed: true },
      { id: "l3", title: "Understanding the Basics", duration: "8m", type: "reading", completed: true },
      { id: "l4", title: "Knowledge Check", duration: "5m", type: "quiz", completed: true },
    ],
  },
  {
    id: "m2",
    title: "Core Concepts",
    lessons: [
      { id: "l5", title: "Components & Props", duration: "18m", type: "video", completed: true },
      { id: "l6", title: "State Management", duration: "22m", type: "video", completed: true },
      { id: "l7", title: "Lifecycle & Effects", duration: "15m", type: "video", completed: false },
      { id: "l8", title: "Practice Exercise", duration: "20m", type: "reading", completed: false },
      { id: "l9", title: "Module Quiz", duration: "10m", type: "quiz", completed: false },
    ],
  },
  {
    id: "m3",
    title: "Advanced Patterns",
    lessons: [
      { id: "l10", title: "Server Components", duration: "25m", type: "video", completed: false },
      { id: "l11", title: "Data Fetching Strategies", duration: "20m", type: "video", completed: false },
      { id: "l12", title: "Caching & Revalidation", duration: "18m", type: "video", completed: false },
      { id: "l13", title: "Advanced Routing", duration: "15m", type: "reading", completed: false },
    ],
  },
  {
    id: "m4",
    title: "Building a Project",
    lessons: [
      { id: "l14", title: "Project Setup", duration: "10m", type: "video", completed: false },
      { id: "l15", title: "Building the UI", duration: "30m", type: "video", completed: false },
      { id: "l16", title: "API Integration", duration: "25m", type: "video", completed: false },
      { id: "l17", title: "Deployment", duration: "12m", type: "video", completed: false },
      { id: "l18", title: "Final Assessment", duration: "15m", type: "quiz", completed: false },
    ],
  },
]

export const stats = {
  coursesEnrolled: 4,
  coursesCompleted: 1,
  totalHours: 42,
  certificates: 1,
  streak: 12,
  avgScore: 87,
}

export const weeklyActivity = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 0.5 },
  { day: "Fri", hours: 2.0 },
  { day: "Sat", hours: 4.1 },
  { day: "Sun", hours: 1.5 },
]

export const notifications = [
  { id: "n1", title: "New lesson available", message: "Server Components deep dive is now live", time: "2h ago", read: false },
  { id: "n2", title: "Assignment due", message: "Submit your React project by Friday", time: "5h ago", read: false },
  { id: "n3", title: "Course completed!", message: "Congratulations on completing UI/UX Design", time: "1d ago", read: true },
  { id: "n4", title: "Weekly report", message: "You studied 15.6 hours this week", time: "2d ago", read: true },
]

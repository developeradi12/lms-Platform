// "use client";

// import { useEffect, useState } from "react";
// import { BackgroundBeams } from "./ui/background-beams";
// import { Button } from "./ui/moving-border";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// const texts = [
//   "Learn Smarter",
//   "Build Faster",
//   "Grow Your Skills",
//   "Launch Your Career",
// ];

// type UserType = {
//   firstName: string;
//   lastName: string;
// };

// const HeroSection: React.FC = () => {
//   const [index, setIndex] = useState(0);
 

//   const router = useRouter();

//   // Text animation
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIndex((prev) => (prev + 1) % texts.length);
//     }, 2000);

//     return () => clearInterval(interval);
//   }, []);
 

//   return (
//     <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
//       <div className="absolute z-40 text-center px-6 max-w-4xl">
//         <h1 className="text-4xl md:text-6xl font-bold leading-tight">
//           The Best Platform to
//           <span className="block mt-3 text-blue-400 transition-all duration-500">
//             {texts[index]}
//           </span>
//         </h1>

//         <p className="mt-6 text-lg md:text-xl text-gray-300">
//           Learn with structured courses, real-world projects, and guided mentorship.
//         </p>

//         {/* Buttons */}
//         <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
//             <>
//               <Link href="/login">
//                 <Button className="px-8 py-3 cursor-pointer">
//                   Login
//                 </Button>
//               </Link>

//               <Link href="/sign_up">
//                 <Button className="px-8 py-3 cursor-pointer">
//                   Signup
//                 </Button>
//               </Link>
//             </>
//         </div>
//       </div>

//       <BackgroundBeams />
//     </section>
//   );
// };

// export default HeroSection;
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "motion/react"

import { BackgroundBeams } from "./ui/background-beams"
import { Navbar } from "./Navbar"

const texts = [
  "Learn Smarter",
  "Build Faster",
  "Grow Your Skills",
  "Launch Your Career",
]

export function HeroSection() {
  const [index, setIndex] = useState(0)

  // text animation like old code
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">

      <div className="relative z-10 mx-auto flex min-h-screen max-w-full flex-col items-center justify-center px-4">
        <Navbar />

        {/* Borders (same as your new UI) */}
        <div className="absolute inset-y-0 left-0 hidden h-full w-px bg-white/10 md:block">
          <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        </div>

        <div className="absolute inset-y-0 right-0 hidden h-full w-px bg-white/10 md:block">
          <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 hidden h-px w-full bg-white/10 md:block">
          <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>

        {/* Content */}
        <div className="w-full px-2 py-10 md:py-20">
          <h1 className="mx-auto max-w-4xl text-center text-3xl font-bold leading-tight md:text-5xl lg:text-7xl">
            The Best Platform to
            <span className="block mt-4 text-blue-400">
              {texts[index]
                .split(" ")
                .map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, filter: "blur(6px)", y: 10 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: i * 0.08,
                      ease: "easeInOut",
                    }}
                    className="mr-2 inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-center text-base text-gray-300 md:text-xl"
          >
            Learn with structured courses, real-world projects, and guided
            mentorship.
          </motion.p>

          {/* Buttons (old links) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/courses"
              className="w-full sm:w-60 rounded-lg bg-white px-6 py-3 text-center font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-200"
            >
              Explore Courses
            </Link>

          </motion.div>

          {/* Preview Image */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="mx-auto mt-16 max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur"
          >
            <div className="w-full overflow-hidden rounded-2xl border border-white/10">
              <img
                src=""
                alt="Landing preview"
                className="aspect-[16/9] h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


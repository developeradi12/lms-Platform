"use client";

import { useEffect, useState } from "react";
import { BackgroundBeams } from "./ui/background-beams";
import { Button } from "./ui/moving-border";
import Link from "next/link";
import { useRouter } from "next/navigation";

const texts = [
  "Learn Smarter",
  "Build Faster",
  "Grow Your Skills",
  "Launch Your Career",
];

type UserType = {
  firstName: string;
  lastName: string;
};

const HeroSection: React.FC = () => {
  const [index, setIndex] = useState(0);
 

  const router = useRouter();

  // Text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
 

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="absolute z-40 text-center px-6 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          The Best Platform to
          <span className="block mt-3 text-blue-400 transition-all duration-500">
            {texts[index]}
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-300">
          Learn with structured courses, real-world projects, and guided mentorship.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <>
              <Link href="/login">
                <Button className="px-8 py-3 cursor-pointer">
                  Login
                </Button>
              </Link>

              <Link href="/sign_up">
                <Button className="px-8 py-3 cursor-pointer">
                  Signup
                </Button>
              </Link>
            </>
        </div>
      </div>

      <BackgroundBeams />
    </section>
  );
};

export default HeroSection;

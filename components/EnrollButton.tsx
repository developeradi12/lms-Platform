'use client';

import { useRouter } from "next/navigation";

export default function EnrollButton() {
  const router = useRouter();

  const isLoggedIn = false; // replace with auth state

  const handleEnroll = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    router.push("/checkout");
  };

  return (
    <button
      onClick={handleEnroll}
      className="bg-blue-600 text-white px-6 py-3 rounded-xl"
    >
      Enroll Now
    </button>
  );
}

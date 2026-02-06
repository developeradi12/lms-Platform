'use client';

import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "fixed top-6 inset-x-0 z-50 px-4",
        className
      )}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4">

        {/* Left Menu */}
        <Menu setActive={setActive}>
          <Link href="/" className=" hover:text-gray-300 text-black transition">
            Home
          </Link>

          <Link href="/courses" className="text-black hover:text-gray-300 transition">
            Courses
          </Link>

          <Link href="/about-us" className="text-black hover:text-gray-300 transition">
            About
          </Link>

          <Link href="/contact" className="text-black hover:text-gray-300 transition">
            Contact
          </Link>
        </Menu>

        {/* Right Auth */}
        <Link
          href="/login"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-black transition"
        >
          Login / Sign up
        </Link>

      </div>
    </div>
  );
}

export default Navbar;

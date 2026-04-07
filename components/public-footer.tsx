"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, ChevronRight, Facebook, Twitter, Youtube } from "lucide-react"

function ArrowCircle() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-white/50 flex-shrink-0">
      <ChevronRight size={11} strokeWidth={2.5} />
    </span>
  )
}

const quickLinks = ["Home", "About Us", "Contact Us", "Blogs"]

const courses = [
  "IB", "Cambridge", "Career Counselling",
  "Pathways and vocational courses", "School Consultants", "Subjects",
]

export function PublicFooter() {
  return (
    <footer style={{ backgroundColor: "#0d4f96" }} className="text-white">
      <div className="max-w-8xl mx-auto  py-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-8">

          {/* Tagline */}
          <div className="text-[18px] text-white leading-relaxed pt-20">
            Guiding Students Towards the Right Path of Education and Career Success.
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[16px] font-bold tracking-[0.08em] mb-3.5 pt-4">QUICK LINKS</h3>
            <ul>
              {quickLinks.map((item) => (
                <li key={item} className="border-b border-white/20 last:border-0">
                  <Link href="#" className="flex items-center gap-2.5 py-2.5 text-[15px] text-white transition">
                    <ArrowCircle />{item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-[16px] font-bold tracking-[0.08em] mb-3.5">EXPLORE COURSES</h3>
            <ul>
              {courses.map((item) => (
                <li key={item} className="border-b border-white/20 last:border-0">
                  <Link href="#" className="flex items-center gap-2.5 py-2.5 text-[15px] text-white transition">
                    <ArrowCircle />{item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[16px] font-bold tracking-[0.08em] mb-3.5">CONNECT WITH US</h3>
            <div className="divide-y divide-white/20 text-[15px] text-white">
              <div className="flex gap-2.5 items-start py-2.5">
                <Phone size={15} className="mt-0.5 shrink-0 text-white" />
                <span>+91 9913609395,<br />+91 8980800665</span>
              </div>
              <div className="flex gap-2.5 items-center py-2.5">
                <Mail size={15} className="shrink-0 text-white" />
                <span>info@abbieeducation.world</span>
              </div>
              <div className="flex gap-2.5 items-start py-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-white" />
                <span>714-715, Shilp Epitome , opposite Nayara Petrol pump , Rajpath – Sindhu Bhavan road , Bodakdev, Ahmedabad – 380054</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="flex justify-center gap-3 mt-9">
          {[Facebook, Twitter, Youtube].map((Icon, i) => (
            <button key={i} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition"
              style={{ background: "rgba(255,255,255,0.22)" }}>
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-7 border-t border-white/20 pt-5 flex items-center justify-between px-16">
          <div>
            <div className="text-[22px] font-black tracking-wide leading-tight px-12" style={{ color: "#4db8ff" }}>ABBIE</div>
            <div className="text-[22px] font-bold tracking-[0.18em]" style={{ color: "#4db8ff" }}>EDUCATION</div>
          </div>
          <p className="text-[18px] text-[#cce0ee]">Copyright © 2026 Ab | Powered by Ab</p>
        </div>
      </div>
    </footer>
  )
}
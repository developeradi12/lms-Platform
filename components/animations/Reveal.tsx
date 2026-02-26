"use client"

import { useEffect, useRef, useState } from "react"

export default function Reveal({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  )
}
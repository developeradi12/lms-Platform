"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Banner } from "@/types/banner"

export default function Hero() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  /*  Detect screen */
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkScreen()
    window.addEventListener("resize", checkScreen)

    return () => window.removeEventListener("resize", checkScreen)
  }, [])

  /*  Fetch banners */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/admin/banner")
        const json = await res.json()
        setBanners(json.banners ?? [])
      } catch {
        console.error("Failed to fetch banners")
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  /* 🔥 Loading */
  if (loading) {
    return (
      <section className="w-full h-[500px] sm:h-[450px] md:h-[380px] lg:h-[420px] xl:h-[520px]">
        <Skeleton className="w-full h-full" />
      </section>
    )
  }

  const mobileBanners = banners.filter(b => b.isMobile === true)
  const desktopBanners = banners.filter(b => b.isMobile === false)

  const filteredBanners = isMobile
    ? (mobileBanners.length ? mobileBanners : desktopBanners)
    : (desktopBanners.length ? desktopBanners : mobileBanners)

  if (!filteredBanners.length) return null

  const shouldLoop = filteredBanners.length >= 3

  return (
    <section className="w-full h-[500px] sm:h-[450px] md:h-[380px] lg:h-[420px] xl:h-[520px]">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={shouldLoop}
        navigation
        pagination={{ clickable: true }}
        className="h-full w-full"
      >
        {filteredBanners.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt="Banner"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
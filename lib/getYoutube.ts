export function getYoutubeId(url: string) {
  try {
    const u = new URL(url)

    // youtu.be/VIDEOID
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "")
    }

    // youtube.com/watch?v=VIDEOID
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v")
    }

    // youtube.com/embed/VIDEOID
    if (u.pathname.includes("/embed/")) {
      return u.pathname.split("/embed/")[1]
    }

    return null
  } catch {
    return null
  }
}

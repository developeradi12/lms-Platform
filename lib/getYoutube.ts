export function getYoutubeId(url: string) {
  try {
    const u = new URL(url) //URL string ko proper URL object me convert

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

/*Ye function 3 type ke YouTube links support karta hai:

youtu.be/VIDEOID

youtube.com/watch?v=VIDEOID

youtube.com/embed/VIDEOID

Aur agar URL invalid ho ya match na ho → null.*/
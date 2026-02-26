export function formatDuration(minutes: number | string | null | undefined): string {
  const totalMinutes = Number(minutes)

  if (!totalMinutes || isNaN(totalMinutes) || totalMinutes <= 0) {
    return "0m"
  }

  const hrs = Math.floor(totalMinutes / 60)
  const mins = Math.floor(totalMinutes % 60)

  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`

  return `${hrs}h ${mins}m`
}
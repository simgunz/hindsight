export function delayFraction(delayMs: number, availableMs: number): number {
  if (availableMs <= 0) return 1
  const fraction = 1 - delayMs / availableMs
  return Math.min(1, Math.max(0, fraction))
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

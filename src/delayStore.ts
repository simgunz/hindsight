const KEY = 'hindsight.delaySeconds'

export function loadDelaySeconds(fallback: number): number {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return fallback
    const value = Number(raw)
    return Number.isFinite(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function saveDelaySeconds(seconds: number): void {
  try {
    localStorage.setItem(KEY, String(seconds))
  } catch {
    return
  }
}

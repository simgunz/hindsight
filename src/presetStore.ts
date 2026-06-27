export interface Preset {
  label: string
  seconds: number
}

const KEY = 'hindsight.presets'

function isPreset(value: unknown): value is Preset {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Preset).label === 'string' &&
    typeof (value as Preset).seconds === 'number' &&
    Number.isFinite((value as Preset).seconds)
  )
}

export function parsePresets(raw: string | null): Preset[] {
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPreset)
  } catch {
    return []
  }
}

export function loadPresets(): Preset[] {
  try {
    return parsePresets(localStorage.getItem(KEY))
  } catch {
    return []
  }
}

export function savePresets(presets: Preset[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(presets))
  } catch {
    return
  }
}

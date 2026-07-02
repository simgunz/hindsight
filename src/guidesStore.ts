import type { SnapAxis } from './guideGeometry'

/** All guide coordinates are normalized to 0..1 of the viewport so they survive
 * resize and orientation changes (FR-023). */
export interface LineGuide {
  type: 'line'
  ax: number
  ay: number
  bx: number
  by: number
  snap: SnapAxis
}

export interface PointGuide {
  type: 'point'
  x: number
  y: number
}

export type Guide = LineGuide | PointGuide

const KEY = 'hindsight.guides'

function isNorm(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isGuide(value: unknown): value is Guide {
  if (typeof value !== 'object' || value === null) return false
  const g = value as Guide
  if (g.type === 'line')
    return isNorm(g.ax) && isNorm(g.ay) && isNorm(g.bx) && isNorm(g.by)
  if (g.type === 'point')
    return isNorm((g as PointGuide).x) && isNorm((g as PointGuide).y)
  return false
}

export function parseGuides(raw: string | null): Guide[] {
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isGuide)
  } catch {
    return []
  }
}

export function loadGuides(): Guide[] {
  try {
    return parseGuides(localStorage.getItem(KEY))
  } catch {
    return []
  }
}

export function saveGuides(guides: Guide[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(guides))
  } catch {
    return
  }
}

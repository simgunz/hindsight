export type SnapAxis = 'vertical' | 'horizontal' | null

export interface SnappedLine {
  bx: number
  by: number
  snap: SnapAxis
}

const DEG = 180 / Math.PI

/**
 * Constrain a segment's angle to true vertical/horizontal when it lands within
 * `thresholdDeg` of that axis. Point A stays fixed; only B moves, and only along
 * the minor axis, so the segment stays anchored where the user tapped A (FR-022).
 * Length therefore collapses to the major-axis extent, matching "the line is the
 * segment between the two taps, angle-constrained".
 */
export function snapLine(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  thresholdDeg = 8,
): SnappedLine {
  const dx = bx - ax
  const dy = by - ay
  if (dx === 0 && dy === 0) return { bx, by, snap: null }
  // Deviation from the vertical axis (0 when perfectly vertical).
  const fromVertical = Math.abs(Math.atan2(dx, dy) * DEG)
  const dv = Math.min(fromVertical, 180 - fromVertical)
  // Deviation from the horizontal axis (0 when perfectly horizontal).
  const fromHorizontal = Math.abs(Math.atan2(dy, dx) * DEG)
  const dh = Math.min(fromHorizontal, 180 - fromHorizontal)
  if (dv <= thresholdDeg && dv <= dh) return { bx: ax, by, snap: 'vertical' }
  if (dh <= thresholdDeg) return { bx, by: ay, snap: 'horizontal' }
  return { bx, by, snap: null }
}

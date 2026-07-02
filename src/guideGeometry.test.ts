import { describe, expect, it } from 'vitest'
import { snapLine } from './guideGeometry'

describe('snapLine', () => {
  it('snaps a near-vertical segment to true vertical, anchored at A', () => {
    const result = snapLine(0.5, 0.2, 0.52, 0.8)
    expect(result.snap).toBe('vertical')
    expect(result.bx).toBe(0.5)
    expect(result.by).toBe(0.8)
  })

  it('snaps a near-horizontal segment to true horizontal, anchored at A', () => {
    const result = snapLine(0.2, 0.5, 0.8, 0.53)
    expect(result.snap).toBe('horizontal')
    expect(result.by).toBe(0.5)
    expect(result.bx).toBe(0.8)
  })

  it('leaves a clearly diagonal segment unsnapped', () => {
    const result = snapLine(0.2, 0.2, 0.8, 0.8)
    expect(result.snap).toBeNull()
    expect(result).toMatchObject({ bx: 0.8, by: 0.8 })
  })

  it('snaps regardless of point order (B above A)', () => {
    const result = snapLine(0.5, 0.8, 0.49, 0.2)
    expect(result.snap).toBe('vertical')
    expect(result.bx).toBe(0.5)
  })

  it('does not snap just outside the threshold', () => {
    // ~14deg from vertical, beyond the 8deg default threshold
    const result = snapLine(0, 0, 0.25, 1)
    expect(result.snap).toBeNull()
  })

  it('returns the point unchanged for a zero-length segment', () => {
    expect(snapLine(0.3, 0.3, 0.3, 0.3)).toEqual({
      bx: 0.3,
      by: 0.3,
      snap: null,
    })
  })
})

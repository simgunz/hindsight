import { describe, expect, it } from 'vitest'
import { DELAY_LADDER, formatWheelLabel } from './delayWheel'

describe('delay wheel ladder', () => {
  it('runs from live (0) to 240 in uniform 5s steps', () => {
    expect(DELAY_LADDER[0]).toBe(0)
    expect(DELAY_LADDER[1]).toBe(5)
    expect(DELAY_LADDER.at(-1)).toBe(240)
    expect(DELAY_LADDER).toHaveLength(49)
  })
})

describe('formatWheelLabel', () => {
  it('labels zero as Live', () => {
    expect(formatWheelLabel(0)).toBe('Live')
  })

  it('labels other values in seconds', () => {
    expect(formatWheelLabel(30)).toBe('30s')
  })
})

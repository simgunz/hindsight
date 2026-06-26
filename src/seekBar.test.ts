import { describe, expect, it } from 'vitest'
import { delayFraction, formatClock } from './seekBar'

describe('delayFraction', () => {
  it('places live (zero delay) at the right edge', () => {
    expect(delayFraction(0, 120000)).toBe(1)
  })

  it('places the oldest frame at the left edge', () => {
    expect(delayFraction(120000, 120000)).toBe(0)
  })

  it('places a mid-buffer delay halfway', () => {
    expect(delayFraction(60000, 120000)).toBe(0.5)
  })

  it('clamps a delay beyond the oldest frame to the left edge', () => {
    expect(delayFraction(200000, 120000)).toBe(0)
  })

  it('returns the live edge when no footage is buffered', () => {
    expect(delayFraction(0, 0)).toBe(1)
  })
})

describe('formatClock', () => {
  it('formats minutes and zero-padded seconds', () => {
    expect(formatClock(150000)).toBe('2:30')
  })

  it('zero-pads single-digit seconds', () => {
    expect(formatClock(5000)).toBe('0:05')
  })

  it('floors a negative span to zero', () => {
    expect(formatClock(-100)).toBe('0:00')
  })
})

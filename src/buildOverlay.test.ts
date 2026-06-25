import { describe, expect, it } from 'vitest'
import { formatTargetSeconds, remainingSeconds } from './buildOverlay'

describe('formatTargetSeconds', () => {
  it('rounds the target delay to whole seconds', () => {
    expect(formatTargetSeconds(10_000)).toBe(10)
  })
})

describe('remainingSeconds', () => {
  it('rounds the time left up to the next whole second', () => {
    expect(remainingSeconds(10_000, 3500)).toBe(7)
  })

  it('never goes negative once the target is reached', () => {
    expect(remainingSeconds(10_000, 12_000)).toBe(0)
  })
})

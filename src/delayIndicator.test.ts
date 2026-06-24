import { describe, expect, it } from 'vitest'
import { formatDelayLabel } from './delayIndicator'

describe('formatDelayLabel', () => {
  it('renders the rounded delay in seconds with a leading minus', () => {
    expect(formatDelayLabel(10000)).toBe('−10s')
  })

  it('rounds sub-second precision to the nearest second during the ramp', () => {
    expect(formatDelayLabel(3400)).toBe('−3s')
  })

  it('renders zero at the start of the ramp', () => {
    expect(formatDelayLabel(0)).toBe('−0s')
  })
})

import { describe, expect, it } from 'vitest'
import { formatDelayLabel } from './delayIndicator'

describe('formatDelayLabel', () => {
  it('renders the rounded delay in seconds with a leading minus', () => {
    expect(formatDelayLabel(10000)).toBe('−10s')
  })

  it('rounds sub-second precision to the nearest second during the ramp', () => {
    expect(formatDelayLabel(3400)).toBe('−3s')
  })

  it('renders LIVE at zero delay (the live edge)', () => {
    expect(formatDelayLabel(0)).toBe('LIVE')
  })
})

import { describe, expect, it } from 'vitest'
import { screenAngleToRotation, uprightDimensions } from './orientation'

describe('uprightDimensions', () => {
  it('keeps dimensions when the rotation is a half turn', () => {
    expect(uprightDimensions(1280, 720, 180)).toEqual({
      width: 1280,
      height: 720,
    })
  })

  it('swaps width and height when the rotation is a quarter turn', () => {
    expect(uprightDimensions(1280, 720, 90)).toEqual({
      width: 720,
      height: 1280,
    })
  })
})

describe('screenAngleToRotation', () => {
  it('corrects a landscape sensor by a quarter turn when the screen is upright', () => {
    expect(screenAngleToRotation(0)).toBe(90)
  })

  it('needs no correction once the screen has turned to meet the sensor', () => {
    expect(screenAngleToRotation(90)).toBe(0)
  })
})

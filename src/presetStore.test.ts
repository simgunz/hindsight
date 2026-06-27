import { describe, expect, it } from 'vitest'
import { parsePresets } from './presetStore'

describe('parsePresets', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(parsePresets(null)).toEqual([])
  })

  it('parses a stored list of presets', () => {
    const raw = JSON.stringify([{ label: 'Gym', seconds: 60 }])
    expect(parsePresets(raw)).toEqual([{ label: 'Gym', seconds: 60 }])
  })

  it('returns an empty list for malformed JSON', () => {
    expect(parsePresets('{not json')).toEqual([])
  })

  it('returns an empty list when the payload is not an array', () => {
    expect(parsePresets('{"label":"Gym","seconds":60}')).toEqual([])
  })

  it('drops entries with an invalid label or seconds', () => {
    const raw = JSON.stringify([
      { label: 'Gym', seconds: 60 },
      { label: 5, seconds: 30 },
      { label: 'Bad', seconds: 'x' },
      { label: 'NaN', seconds: Number.NaN },
    ])
    expect(parsePresets(raw)).toEqual([{ label: 'Gym', seconds: 60 }])
  })
})

import { describe, expect, it } from 'vitest'
import { parseGuides } from './guidesStore'

describe('parseGuides', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(parseGuides(null)).toEqual([])
  })

  it('parses stored line and point guides', () => {
    const raw = JSON.stringify([
      { type: 'line', ax: 0.5, ay: 0.2, bx: 0.5, by: 0.8, snap: 'vertical' },
      { type: 'point', x: 0.4, y: 0.6 },
    ])
    expect(parseGuides(raw)).toEqual([
      { type: 'line', ax: 0.5, ay: 0.2, bx: 0.5, by: 0.8, snap: 'vertical' },
      { type: 'point', x: 0.4, y: 0.6 },
    ])
  })

  it('returns an empty list for malformed JSON', () => {
    expect(parseGuides('{not json')).toEqual([])
  })

  it('returns an empty list when the payload is not an array', () => {
    expect(parseGuides('{"type":"point","x":0.5,"y":0.5}')).toEqual([])
  })

  it('drops guides with missing or invalid coordinates', () => {
    const raw = JSON.stringify([
      { type: 'point', x: 0.4, y: 0.6 },
      { type: 'line', ax: 0.1, ay: 0.1, bx: 0.2 },
      { type: 'point', x: 'x', y: 0.6 },
      { type: 'bogus', x: 0.5, y: 0.5 },
    ])
    expect(parseGuides(raw)).toEqual([{ type: 'point', x: 0.4, y: 0.6 }])
  })
})

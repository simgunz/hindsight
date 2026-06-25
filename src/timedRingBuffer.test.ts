import { describe, expect, it } from 'vitest'
import { TimedRingBuffer } from './timedRingBuffer'

describe('TimedRingBuffer', () => {
  it('tracks size as entries are pushed', () => {
    const buffer = new TimedRingBuffer<string>()
    buffer.push(0, 100, 'a')
    buffer.push(33, 100, 'b')
    expect(buffer.size).toBe(2)
  })

  it('returns the entry active at a given time', () => {
    const buffer = new TimedRingBuffer<string>()
    buffer.push(0, 100, 'a')
    buffer.push(33, 100, 'b')
    buffer.push(66, 100, 'c')
    expect(buffer.chunkAt(40)).toBe('b')
  })

  it('tracks total bytes across entries', () => {
    const buffer = new TimedRingBuffer<string>()
    buffer.push(0, 100, 'a')
    buffer.push(33, 150, 'b')
    expect(buffer.bytes).toBe(250)
  })

  it('reports the oldest and newest entry times', () => {
    const buffer = new TimedRingBuffer<string>()
    buffer.push(10, 100, 'a')
    buffer.push(40, 100, 'b')
    buffer.push(70, 100, 'c')
    expect(buffer.oldestTime).toBe(10)
    expect(buffer.newestTime).toBe(70)
  })

  it('evicts entries older than the max window', () => {
    const buffer = new TimedRingBuffer<string>(100)
    buffer.push(0, 10, 'a')
    buffer.push(50, 10, 'b')
    buffer.push(100, 10, 'c')
    buffer.push(200, 10, 'd')
    expect(buffer.size).toBe(2)
  })

  it('keeps the frame straddling the window start so lookups at the edge resolve', () => {
    const buffer = new TimedRingBuffer<string>(100)
    buffer.push(0, 10, 'a')
    buffer.push(150, 10, 'b')
    expect(buffer.chunkAt(50)).toBe('a')
  })

  it('finds the latest value at or before a time matching a predicate', () => {
    const buffer = new TimedRingBuffer<{ key: boolean }>()
    buffer.push(0, 10, { key: true })
    buffer.push(33, 10, { key: false })
    buffer.push(66, 10, { key: true })
    buffer.push(99, 10, { key: false })
    expect(buffer.findLatest(90, (v) => v.key)).toEqual({ key: true })
    expect(buffer.findLatest(50, (v) => v.key)).toEqual({ key: true })
  })

  it('returns the ordered values within an inclusive time range', () => {
    const buffer = new TimedRingBuffer<string>()
    buffer.push(0, 10, 'a')
    buffer.push(33, 10, 'b')
    buffer.push(66, 10, 'c')
    buffer.push(99, 10, 'd')
    expect(buffer.entriesBetween(33, 66)).toEqual(['b', 'c'])
  })

  it('evicts down to the new window when it is reduced', () => {
    const buffer = new TimedRingBuffer<string>(1000)
    buffer.push(0, 10, 'a')
    buffer.push(500, 10, 'b')
    buffer.push(1000, 10, 'c')
    buffer.setMaxWindow(200)
    expect(buffer.size).toBe(2)
  })

  it('evicts the oldest entries when total bytes exceed the budget', () => {
    const buffer = new TimedRingBuffer<string>(Number.POSITIVE_INFINITY, 250)
    buffer.push(0, 100, 'a')
    buffer.push(33, 100, 'b')
    buffer.push(66, 100, 'c')
    expect(buffer.bytes).toBe(200)
    expect(buffer.oldestTime).toBe(33)
  })
})

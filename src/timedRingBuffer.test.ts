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
})

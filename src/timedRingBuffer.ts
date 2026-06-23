interface TimedEntry<T> {
  time: number
  bytes: number
  value: T
}

export class TimedRingBuffer<T> {
  private readonly entries: TimedEntry<T>[] = []
  private totalBytes = 0
  private readonly maxWindowMs: number

  constructor(maxWindowMs: number = Number.POSITIVE_INFINITY) {
    this.maxWindowMs = maxWindowMs
  }

  push(time: number, bytes: number, value: T): void {
    this.entries.push({ time, bytes, value })
    this.totalBytes += bytes
    this.evict(time - this.maxWindowMs)
  }

  private evict(cutoff: number): void {
    while (this.entries.length > 0 && this.entries[0].time < cutoff) {
      const dropped = this.entries.shift()
      if (dropped) {
        this.totalBytes -= dropped.bytes
      }
    }
  }

  get size(): number {
    return this.entries.length
  }

  get bytes(): number {
    return this.totalBytes
  }

  get oldestTime(): number | undefined {
    return this.entries[0]?.time
  }

  get newestTime(): number | undefined {
    return this.entries[this.entries.length - 1]?.time
  }

  chunkAt(targetTime: number): T | undefined {
    let active: TimedEntry<T> | undefined
    for (const entry of this.entries) {
      if (entry.time <= targetTime) {
        active = entry
      } else {
        break
      }
    }
    return active?.value
  }
}

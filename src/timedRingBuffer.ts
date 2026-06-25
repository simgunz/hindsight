interface TimedEntry<T> {
  time: number
  bytes: number
  value: T
}

export class TimedRingBuffer<T> {
  private readonly entries: TimedEntry<T>[] = []
  private totalBytes = 0
  private maxWindowMs: number
  private maxBytes: number

  constructor(
    maxWindowMs: number = Number.POSITIVE_INFINITY,
    maxBytes: number = Number.POSITIVE_INFINITY,
  ) {
    this.maxWindowMs = maxWindowMs
    this.maxBytes = maxBytes
  }

  setMaxWindow(maxWindowMs: number): void {
    this.maxWindowMs = maxWindowMs
    this.evict()
  }

  push(time: number, bytes: number, value: T): void {
    this.entries.push({ time, bytes, value })
    this.totalBytes += bytes
    this.evict()
  }

  private evict(): void {
    const newest = this.entries[this.entries.length - 1]?.time
    if (newest === undefined) return
    const cutoff = newest - this.maxWindowMs
    while (
      this.entries.length > 1 &&
      (this.entries[1].time <= cutoff || this.totalBytes > this.maxBytes)
    ) {
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

  findLatest(
    targetTime: number,
    predicate: (value: T) => boolean,
  ): T | undefined {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const entry = this.entries[i]
      if (entry.time <= targetTime && predicate(entry.value)) return entry.value
    }
    return undefined
  }

  entriesBetween(fromTime: number, toTime: number): T[] {
    const result: T[] = []
    for (const entry of this.entries) {
      if (entry.time >= fromTime && entry.time <= toTime)
        result.push(entry.value)
    }
    return result
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

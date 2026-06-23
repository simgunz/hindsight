interface TimedEntry<T> {
  time: number
  bytes: number
  value: T
}

export class TimedRingBuffer<T> {
  private readonly entries: TimedEntry<T>[] = []
  private totalBytes = 0

  push(time: number, bytes: number, value: T): void {
    this.entries.push({ time, bytes, value })
    this.totalBytes += bytes
  }

  get size(): number {
    return this.entries.length
  }

  get bytes(): number {
    return this.totalBytes
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

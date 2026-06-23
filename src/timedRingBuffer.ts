interface TimedEntry<T> {
  time: number
  bytes: number
  value: T
}

export class TimedRingBuffer<T> {
  private readonly entries: TimedEntry<T>[] = []

  push(time: number, bytes: number, value: T): void {
    this.entries.push({ time, bytes, value })
  }

  get size(): number {
    return this.entries.length
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

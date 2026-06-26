export function delayFraction(delayMs: number, availableMs: number): number {
  if (availableMs <= 0) return 1
  const fraction = 1 - delayMs / availableMs
  return Math.min(1, Math.max(0, fraction))
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export class SeekBar {
  readonly element: HTMLDivElement
  private readonly limit: HTMLSpanElement
  private readonly home: HTMLDivElement
  private readonly playhead: HTMLDivElement

  constructor() {
    const element = document.createElement('div')
    element.className = 'seek-bar'

    const limit = document.createElement('span')
    limit.className = 'seek-limit'

    const track = document.createElement('div')
    track.className = 'seek-track'

    const home = document.createElement('div')
    home.className = 'seek-home'

    const live = document.createElement('div')
    live.className = 'seek-live'

    const playhead = document.createElement('div')
    playhead.className = 'seek-playhead'

    track.append(home, live, playhead)

    const liveLabel = document.createElement('span')
    liveLabel.className = 'seek-live-label'
    liveLabel.textContent = 'LIVE'

    element.append(limit, track, liveLabel)

    this.element = element
    this.limit = limit
    this.home = home
    this.playhead = playhead
  }

  sync(
    scrubbing: boolean,
    effectiveDelayMs: number,
    baseDelayMs: number,
    availableMs: number,
  ): void {
    this.element.classList.toggle('visible', scrubbing)
    if (!scrubbing) return
    this.playhead.style.left = `${delayFraction(effectiveDelayMs, availableMs) * 100}%`
    this.home.style.left = `${delayFraction(baseDelayMs, availableMs) * 100}%`
    this.limit.textContent = `−${formatClock(availableMs)}`
  }
}

const PAUSE_GLYPH = '⏸'

export function formatDelayLabel(
  effectiveDelayMs: number,
  paused = false,
): string {
  const seconds = Math.round(effectiveDelayMs / 1000)
  const label = seconds === 0 ? 'LIVE' : `−${seconds}s`
  return paused ? `${PAUSE_GLYPH} ${label}` : label
}

export class DelayIndicator {
  readonly element: HTMLDivElement

  constructor() {
    const element = document.createElement('div')
    element.className = 'delay-pill'
    this.element = element
  }

  update(effectiveDelayMs: number, paused = false): void {
    this.element.textContent = formatDelayLabel(effectiveDelayMs, paused)
  }
}

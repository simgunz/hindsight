export function formatDelayLabel(effectiveDelayMs: number): string {
  const seconds = Math.round(effectiveDelayMs / 1000)
  if (seconds === 0) return 'LIVE'
  return `−${seconds}s`
}

export class DelayIndicator {
  readonly element: HTMLDivElement

  constructor() {
    const element = document.createElement('div')
    element.className = 'delay-pill'
    this.element = element
  }

  update(effectiveDelayMs: number, baseDelayMs: number): void {
    this.element.textContent = formatDelayLabel(effectiveDelayMs)
    this.element.classList.toggle(
      'steady',
      effectiveDelayMs >= baseDelayMs - 250,
    )
  }
}

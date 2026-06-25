export function formatDelayLabel(effectiveDelayMs: number): string {
  const seconds = Math.round(effectiveDelayMs / 1000)
  if (seconds === 0) return 'LIVE'
  return `−${seconds}s`
}

export class DelayIndicator {
  readonly element: HTMLDivElement
  private concealed = false

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

  conceal(): void {
    if (this.concealed) return
    this.concealed = true
    this.element.classList.add('concealed')
  }

  reveal(): void {
    if (!this.concealed) return
    this.concealed = false
    this.element.classList.remove('concealed')
    this.element.classList.remove('reveal')
    void this.element.offsetWidth
    this.element.classList.add('reveal')
  }
}

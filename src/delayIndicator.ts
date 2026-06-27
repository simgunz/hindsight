import { pauseIcon } from './icons'

export function formatDelayLabel(effectiveDelayMs: number): string {
  const seconds = Math.round(effectiveDelayMs / 1000)
  return seconds === 0 ? 'LIVE' : `−${seconds}s`
}

export class DelayIndicator {
  readonly element: HTMLDivElement
  private readonly label: HTMLSpanElement

  constructor() {
    const element = document.createElement('div')
    element.className = 'delay-pill'

    const icon = pauseIcon()
    icon.classList.add('pill-pause')
    this.label = document.createElement('span')

    element.append(icon, this.label)
    this.element = element
  }

  update(effectiveDelayMs: number, paused = false): void {
    this.label.textContent = formatDelayLabel(effectiveDelayMs)
    this.element.classList.toggle('paused', paused)
  }
}

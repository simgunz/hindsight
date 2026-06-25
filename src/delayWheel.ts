export const DELAY_LADDER: number[] = [
  0,
  ...Array.from({ length: 48 }, (_, i) => (i + 1) * 5),
]

export function formatWheelLabel(seconds: number): string {
  return seconds === 0 ? 'Live' : `${seconds}s`
}

const ITEM_HEIGHT = 44
const VISIBLE_ROWS = 5
const SETTLE_DELAY_MS = 120

export class DelayWheel {
  readonly element: HTMLDivElement
  private readonly items: HTMLDivElement[] = []
  private readonly onSettle: (seconds: number) => void
  private settleTimer = 0
  private selectedIndex = 0

  constructor(onSettle: (seconds: number) => void) {
    this.onSettle = onSettle
    const element = document.createElement('div')
    element.className = 'wheel'

    const pad = (VISIBLE_ROWS - 1) / 2
    element.append(this.spacer(pad))
    for (const seconds of DELAY_LADDER) {
      const item = document.createElement('div')
      item.className = 'wheel-item'
      item.textContent = formatWheelLabel(seconds)
      this.items.push(item)
      element.append(item)
    }
    element.append(this.spacer(pad))

    element.addEventListener('scroll', () => this.onScroll())
    this.element = element
  }

  setValue(seconds: number): void {
    const index = Math.max(0, DELAY_LADDER.indexOf(seconds))
    this.selectedIndex = index
    this.element.scrollTop = index * ITEM_HEIGHT
    this.highlight(index)
  }

  private spacer(rows: number): HTMLDivElement {
    const spacer = document.createElement('div')
    spacer.className = 'wheel-spacer'
    spacer.style.height = `${rows * ITEM_HEIGHT}px`
    return spacer
  }

  private onScroll(): void {
    const index = this.clampIndex(
      Math.round(this.element.scrollTop / ITEM_HEIGHT),
    )
    this.highlight(index)
    clearTimeout(this.settleTimer)
    this.settleTimer = window.setTimeout(
      () => this.settle(index),
      SETTLE_DELAY_MS,
    )
  }

  private settle(index: number): void {
    if (index === this.selectedIndex) return
    this.selectedIndex = index
    navigator.vibrate?.(10)
    this.onSettle(DELAY_LADDER[index])
  }

  private highlight(index: number): void {
    this.items.forEach((item, i) => {
      item.classList.toggle('selected', i === index)
    })
  }

  private clampIndex(index: number): number {
    return Math.min(DELAY_LADDER.length - 1, Math.max(0, index))
  }
}

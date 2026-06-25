import type { DelayWheel } from './delayWheel'

export class SettingsSheet {
  readonly element: HTMLDivElement

  constructor(wheel: DelayWheel) {
    const root = document.createElement('div')
    root.className = 'sheet-root'

    const scrim = document.createElement('div')
    scrim.className = 'sheet-scrim'
    scrim.addEventListener('click', () => this.close())

    const panel = document.createElement('div')
    panel.className = 'sheet-panel'

    const header = document.createElement('div')
    header.className = 'sheet-header'

    const handle = document.createElement('div')
    handle.className = 'sheet-handle'

    const title = document.createElement('h2')
    title.className = 'sheet-title'
    title.textContent = 'Delay'

    header.append(handle, title)
    this.attachSwipeDown(header)

    const done = document.createElement('button')
    done.type = 'button'
    done.className = 'sheet-done'
    done.textContent = 'Done'
    done.addEventListener('click', () => this.close())

    panel.append(header, wheel.element, done)
    root.append(scrim, panel)
    this.element = root
  }

  private attachSwipeDown(target: HTMLElement): void {
    let startX = 0
    let startY = 0
    let tracking = false
    target.addEventListener('pointerdown', (event) => {
      startX = event.clientX
      startY = event.clientY
      tracking = true
    })
    target.addEventListener('pointerup', (event) => {
      if (!tracking) return
      tracking = false
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      if (dy > 50 && dy > Math.abs(dx)) this.close()
    })
  }

  open(): void {
    this.element.classList.add('open')
  }

  close(): void {
    this.element.classList.remove('open')
  }

  get isOpen(): boolean {
    return this.element.classList.contains('open')
  }
}

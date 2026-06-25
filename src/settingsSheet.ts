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

    const handle = document.createElement('div')
    handle.className = 'sheet-handle'

    const title = document.createElement('h2')
    title.className = 'sheet-title'
    title.textContent = 'Delay'

    const done = document.createElement('button')
    done.type = 'button'
    done.className = 'sheet-done'
    done.textContent = 'Done'
    done.addEventListener('click', () => this.close())

    panel.append(handle, title, wheel.element, done)
    root.append(scrim, panel)
    this.element = root
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

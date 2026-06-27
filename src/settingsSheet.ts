import type { DelayWheel } from './delayWheel'
import { backIcon, cameraFlipIcon, helpIcon, replayIcon } from './icons'

interface GestureRow {
  glyph: string | (() => SVGSVGElement)
  label: string
  desc: string
}

const GESTURES: GestureRow[] = [
  { glyph: '↑', label: 'Swipe up', desc: 'Delay & presets' },
  { glyph: '⊙⊙', label: 'Double-tap', desc: 'Live ↔ your delay' },
  { glyph: '⊙', label: 'Tap', desc: 'Pause / resume' },
  { glyph: '↔', label: 'Drag', desc: 'Rewind and replay' },
  {
    glyph: cameraFlipIcon,
    label: 'Top-right button',
    desc: 'Flip front / back camera',
  },
]

export class SettingsSheet {
  readonly element: HTMLDivElement
  private readonly title: HTMLHeadingElement
  private readonly back: HTMLButtonElement
  private readonly help: HTMLButtonElement
  private readonly delayView: HTMLDivElement
  private readonly gesturesView: HTMLDivElement

  constructor(
    wheel: DelayWheel,
    presetsEl?: HTMLElement,
    onReplay?: () => void,
  ) {
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

    const nav = document.createElement('div')
    nav.className = 'sheet-nav'

    this.back = document.createElement('button')
    this.back.type = 'button'
    this.back.className = 'sheet-icon gone'
    this.back.setAttribute('aria-label', 'Back')
    this.back.appendChild(backIcon())
    this.back.addEventListener('click', () => this.showDelay())

    this.title = document.createElement('h2')
    this.title.className = 'sheet-title'
    this.title.textContent = 'Delay'

    this.help = document.createElement('button')
    this.help.type = 'button'
    this.help.className = 'sheet-icon'
    this.help.setAttribute('aria-label', 'Gestures')
    this.help.appendChild(helpIcon())
    this.help.addEventListener('click', () => this.showGestures())

    nav.append(this.back, this.title, this.help)
    header.append(handle, nav)
    this.attachSwipeDown(header)

    this.delayView = document.createElement('div')
    this.delayView.className = 'sheet-view'
    this.delayView.append(wheel.element)
    if (presetsEl) this.delayView.append(presetsEl)

    this.gesturesView = document.createElement('div')
    this.gesturesView.className = 'sheet-view gestures'
    this.gesturesView.hidden = true
    for (const row of GESTURES) this.gesturesView.append(this.makeRow(row))

    const replay = document.createElement('button')
    replay.type = 'button'
    replay.className = 'gesture-replay'
    replay.appendChild(replayIcon())
    const replayLabel = document.createElement('span')
    replayLabel.textContent = 'Replay walkthrough'
    replay.append(replayLabel)
    replay.addEventListener('click', () => {
      this.close()
      onReplay?.()
    })
    this.gesturesView.append(replay)

    panel.append(header, this.delayView, this.gesturesView)
    root.append(scrim, panel)
    this.element = root
  }

  private makeRow(row: GestureRow): HTMLDivElement {
    const el = document.createElement('div')
    el.className = 'gesture-row'

    const glyph = document.createElement('div')
    glyph.className = 'gesture-glyph'
    if (typeof row.glyph === 'string') glyph.textContent = row.glyph
    else glyph.appendChild(row.glyph())

    const text = document.createElement('div')
    const label = document.createElement('div')
    label.className = 'gesture-label'
    label.textContent = row.label
    const desc = document.createElement('div')
    desc.className = 'gesture-desc'
    desc.textContent = row.desc
    text.append(label, desc)

    el.append(glyph, text)
    return el
  }

  private showGestures(): void {
    this.title.textContent = 'Gestures'
    this.back.classList.remove('gone')
    this.help.classList.add('gone')
    this.delayView.hidden = true
    this.gesturesView.hidden = false
  }

  private showDelay(): void {
    this.title.textContent = 'Delay'
    this.back.classList.add('gone')
    this.help.classList.remove('gone')
    this.gesturesView.hidden = true
    this.delayView.hidden = false
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
    this.showDelay()
    this.element.classList.add('open')
    document.body.classList.add('sheet-open')
  }

  close(): void {
    this.element.classList.remove('open')
    document.body.classList.remove('sheet-open')
  }

  get isOpen(): boolean {
    return this.element.classList.contains('open')
  }
}

import type { DelayWheel } from './delayWheel'
import { cameraFlipIcon, replayIcon } from './icons'

interface GestureRow {
  glyph: string | (() => SVGSVGElement)
  label: string
  desc: string
}

const PRESET_HINT_KEY = 'hindsight.presetHintSeen'

const PRESET_HINTS: [glyph: string, text: string][] = [
  ['＋', 'saves the current delay'],
  ['◉', 'hold a preset to remove'],
]

const GESTURES: GestureRow[] = [
  { glyph: '↑', label: 'Swipe up', desc: 'Delay & presets' },
  { glyph: '⊙⊙', label: 'Double-tap', desc: 'Live ↔ your delay' },
  { glyph: '⊙', label: 'Tap', desc: 'Pause / resume' },
  { glyph: '↔', label: 'Drag', desc: 'Rewind and replay' },
  {
    glyph: cameraFlipIcon,
    label: 'Camera button',
    desc: 'Flip front / back camera',
  },
]

export class SettingsSheet {
  readonly element: HTMLDivElement
  private readonly title: HTMLHeadingElement
  private readonly delayView: HTMLDivElement
  private readonly gesturesView: HTMLDivElement
  private readonly coach: HTMLDivElement | null = null
  private readonly presetsEl: HTMLElement | null = null

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

    this.title = document.createElement('h2')
    this.title.className = 'sheet-title'
    this.title.textContent = 'Delay'

    header.append(handle, this.title)
    this.attachSwipeDown(header)

    this.delayView = document.createElement('div')
    this.delayView.className = 'sheet-view'
    this.delayView.append(wheel.element)
    if (presetsEl) {
      const dock = document.createElement('div')
      dock.className = 'preset-dock'
      this.coach = this.buildCoach()
      this.presetsEl = presetsEl
      dock.append(this.coach, presetsEl)
      this.delayView.append(dock)
    }

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
      // Replaying the walkthrough re-teaches everything, including the
      // preset coachmark, so it shows again next time the sheet opens.
      localStorage.removeItem(PRESET_HINT_KEY)
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

  private buildCoach(): HTMLDivElement {
    const coach = document.createElement('div')
    coach.className = 'preset-coach'

    for (const [glyph, text] of PRESET_HINTS) {
      const row = document.createElement('div')
      row.className = 'coach-row'
      const g = document.createElement('span')
      g.className = 'coach-glyph'
      g.textContent = glyph
      const t = document.createElement('span')
      t.className = 'coach-text'
      t.textContent = text
      row.append(g, t)
      coach.append(row)
    }

    const got = document.createElement('button')
    got.type = 'button'
    got.className = 'coach-dismiss'
    got.textContent = 'Got it'
    got.addEventListener('click', (event) => {
      event.stopPropagation()
      this.dismissCoach()
    })

    const arrow = document.createElement('div')
    arrow.className = 'coach-arrow'

    coach.append(got, arrow)
    return coach
  }

  private maybeShowCoach(): void {
    if (!this.coach) return
    if (localStorage.getItem(PRESET_HINT_KEY) === '1') return
    const noPresets = !this.presetsEl?.querySelector('.preset-chip:not(.add)')
    this.coach.classList.toggle('at-add', noPresets)
    this.coach.classList.add('show')
  }

  private dismissCoach(): void {
    if (!this.coach?.classList.contains('show')) return
    this.coach.classList.remove('show')
    localStorage.setItem(PRESET_HINT_KEY, '1')
  }

  private showGestures(): void {
    this.title.textContent = 'Gestures'
    this.delayView.hidden = true
    this.gesturesView.hidden = false
  }

  private showDelay(): void {
    this.title.textContent = 'Delay'
    this.gesturesView.hidden = true
    this.delayView.hidden = false
    this.maybeShowCoach()
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

  open(view: 'delay' | 'gestures' = 'delay'): void {
    if (view === 'gestures') this.showGestures()
    else this.showDelay()
    this.element.classList.add('open')
    document.body.classList.add('sheet-open')
  }

  close(): void {
    this.dismissCoach()
    this.element.classList.remove('open')
    document.body.classList.remove('sheet-open')
  }

  get isOpen(): boolean {
    return this.element.classList.contains('open')
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ENTER_THRESHOLD_MS = 1200
const LOCK_DURATION_MS = 650

type Phase = 'idle' | 'filling' | 'locking'

export function formatTargetSeconds(targetMs: number): number {
  return Math.round(targetMs / 1000)
}

export function remainingSeconds(
  targetMs: number,
  availableMs: number,
): number {
  return Math.max(0, Math.ceil((targetMs - availableMs) / 1000))
}

export class BuildOverlay {
  readonly element: HTMLDivElement
  private readonly prog: SVGCircleElement
  private readonly bloom: HTMLDivElement
  private readonly targetValue: HTMLSpanElement
  private readonly caption: HTMLElement
  private phase: Phase = 'idle'
  private lockTimer = 0

  constructor() {
    const root = document.createElement('div')
    root.className = 'build-overlay'
    root.hidden = true

    this.bloom = document.createElement('div')
    this.bloom.className = 'build-bloom'

    const gauge = document.createElement('div')
    gauge.className = 'build-gauge'

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', '0 0 200 200')
    svg.setAttribute('aria-hidden', 'true')

    const ticks = document.createElementNS(SVG_NS, 'g')
    ticks.setAttribute('class', 'build-ticks')
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const r2 = i % 5 === 0 ? 101 : 99
      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', String(100 + 96 * Math.cos(a)))
      line.setAttribute('y1', String(100 + 96 * Math.sin(a)))
      line.setAttribute('x2', String(100 + r2 * Math.cos(a)))
      line.setAttribute('y2', String(100 + r2 * Math.sin(a)))
      ticks.appendChild(line)
    }

    const track = document.createElementNS(SVG_NS, 'circle')
    track.setAttribute('class', 'build-track')
    track.setAttribute('cx', '100')
    track.setAttribute('cy', '100')
    track.setAttribute('r', String(RADIUS))

    this.prog = document.createElementNS(SVG_NS, 'circle')
    this.prog.setAttribute('class', 'build-prog')
    this.prog.setAttribute('cx', '100')
    this.prog.setAttribute('cy', '100')
    this.prog.setAttribute('r', String(RADIUS))
    this.prog.style.strokeDasharray = String(CIRCUMFERENCE)
    this.prog.style.strokeDashoffset = String(CIRCUMFERENCE)

    svg.append(ticks, track, this.prog)

    const readout = document.createElement('div')
    readout.className = 'build-readout'

    const target = document.createElement('div')
    target.className = 'build-target'
    const sign = document.createElement('span')
    sign.className = 'build-affix'
    sign.textContent = '−'
    this.targetValue = document.createElement('span')
    this.targetValue.textContent = '0'
    const unit = document.createElement('span')
    unit.className = 'build-affix'
    unit.textContent = 's'
    target.append(sign, this.targetValue, unit)

    this.caption = document.createElement('div')
    this.caption.className = 'build-caption'

    readout.append(target, this.caption)
    gauge.append(svg, readout)
    root.append(this.bloom, gauge)
    this.element = root
  }

  sync(targetMs: number, availableMs: number): void {
    if (this.phase === 'locking') return

    const remaining = targetMs - availableMs
    if (this.phase === 'filling') {
      this.render(targetMs, availableMs)
      if (remaining <= 0) this.lock()
    } else if (targetMs > 0 && remaining > ENTER_THRESHOLD_MS) {
      this.enter()
      this.render(targetMs, availableMs)
    }
  }

  private render(targetMs: number, availableMs: number): void {
    const progress = Math.min(1, Math.max(0, availableMs / targetMs))
    this.prog.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress))
    this.targetValue.textContent = String(formatTargetSeconds(targetMs))
    this.caption.textContent = `Replay in ${remainingSeconds(targetMs, availableMs)}s`
  }

  private enter(): void {
    this.phase = 'filling'
    this.element.hidden = false
    this.element.classList.remove('lock')
    this.bloom.classList.remove('go')
    this.element.classList.remove('enter')
    void this.element.offsetWidth
    this.element.classList.add('enter')
  }

  private lock(): void {
    this.phase = 'locking'
    this.prog.style.strokeDashoffset = '0'
    this.bloom.classList.add('go')
    this.element.classList.add('lock')
    this.lockTimer = window.setTimeout(() => {
      this.element.hidden = true
      this.phase = 'idle'
    }, LOCK_DURATION_MS)
  }

  dispose(): void {
    window.clearTimeout(this.lockTimer)
  }
}

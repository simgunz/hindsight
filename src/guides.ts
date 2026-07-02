import { type SnapAxis, snapLine } from './guideGeometry'
import { type Guide, loadGuides, saveGuides } from './guidesStore'
import {
  closeIcon,
  eyeIcon,
  eyeOffIcon,
  guidesIcon,
  lineIcon,
  pointIcon,
  trashIcon,
} from './icons'

const SVG_NS = 'http://www.w3.org/2000/svg'
const HINT_KEY = 'hindsight.guidesHintSeen'
const WALKTHROUGH_KEY = 'hindsight.walkthroughSeen'
const DRAW_MIN_PX = 6

type Mode = 'idle' | 'add-line' | 'add-point'

type Action =
  | {
      kind: 'draw'
      ax: number
      ay: number
      bx: number
      by: number
      snap: SnapAxis
      moved: boolean
    }
  | { kind: 'move'; startX: number; startY: number; orig: Guide }
  | { kind: 'end'; end: 'a' | 'b' }

export class Guides {
  private readonly overlay: HTMLDivElement
  private readonly svg: SVGSVGElement
  private readonly controls: HTMLDivElement
  private readonly bar: HTMLDivElement
  private readonly hint: HTMLDivElement
  private readonly eyeBtn: HTMLButtonElement
  private readonly deleteBtn: HTMLButtonElement
  private readonly coach: HTMLDivElement

  private guides: Guide[]
  private mode: Mode = 'idle'
  private barOpen = false
  private visible = true
  private selected: number | null = null
  private action: Action | null = null

  constructor(parent: HTMLElement) {
    this.guides = loadGuides()

    this.overlay = document.createElement('div')
    this.overlay.className = 'guides-overlay'
    this.svg = document.createElementNS(SVG_NS, 'svg')
    this.svg.setAttribute('class', 'g-svg')
    this.overlay.append(this.svg)
    this.svg.addEventListener('pointerdown', (e) => this.onOverlayDown(e))

    this.controls = document.createElement('div')
    this.controls.className = 'guides-controls'

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'guides-btn'
    button.setAttribute('aria-label', 'Reference guides')
    button.appendChild(guidesIcon())
    button.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleBar()
    })

    this.bar = document.createElement('div')
    this.bar.className = 'guides-bar'
    this.bar.hidden = true

    const lineBtn = this.tool('Add line', lineIcon(), () =>
      this.startAdd('add-line'),
    )
    lineBtn.classList.add('g-line-tool')
    const pointBtn = this.tool('Add point', pointIcon(), () =>
      this.startAdd('add-point'),
    )
    pointBtn.classList.add('g-point-tool')
    this.eyeBtn = this.tool('Hide guides', eyeIcon(), () =>
      this.toggleVisible(),
    )
    const clearBtn = this.tool('Clear guides', trashIcon(), () => this.clear())
    const closeBtn = this.tool('Close', closeIcon(), () => this.closeBar())

    const sep = document.createElement('span')
    sep.className = 'g-sep'
    this.bar.append(lineBtn, pointBtn, sep, this.eyeBtn, clearBtn, closeBtn)

    this.hint = document.createElement('div')
    this.hint.className = 'guides-hint'
    this.hint.hidden = true

    this.deleteBtn = document.createElement('button')
    this.deleteBtn.type = 'button'
    this.deleteBtn.className = 'g-delete'
    this.deleteBtn.setAttribute('aria-label', 'Delete guide')
    this.deleteBtn.appendChild(closeIcon())
    this.deleteBtn.hidden = true
    this.deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.deleteSelected()
    })

    this.coach = this.buildCoach()

    this.controls.append(
      this.hint,
      button,
      this.bar,
      this.deleteBtn,
      this.coach,
    )

    // Start hidden; main gates this on the delay buffer being ready, so guides
    // never show over the "Starting camera…" status or the build countdown.
    this.overlay.hidden = true
    this.controls.hidden = true

    parent.append(this.overlay, this.controls)

    window.addEventListener('resize', () => this.render())
    window.addEventListener('pointermove', (e) => this.onPointerMove(e))
    window.addEventListener('pointerup', () => this.onPointerUp())
    this.render()
    this.maybeShowCoach()
  }

  /** Gate all guide chrome on the app being ready (delay buffer warmed), so it
   * stays consistent with the other controls during startup and the countdown. */
  setActive(active: boolean): void {
    this.overlay.hidden = !active
    this.controls.hidden = !active
    if (!active) this.cancelAdd()
  }

  private buildCoach(): HTMLDivElement {
    const coach = document.createElement('div')
    coach.className = 'guides-coach'
    const text = document.createElement('div')
    text.className = 'gc-text'
    text.textContent = 'Add reference lines and points to check your form'
    const got = document.createElement('button')
    got.type = 'button'
    got.className = 'gc-dismiss'
    got.textContent = 'Got it'
    got.addEventListener('click', (e) => {
      e.stopPropagation()
      this.dismissCoach()
    })
    const arrow = document.createElement('div')
    arrow.className = 'gc-arrow'
    coach.append(text, got, arrow)
    return coach
  }

  private maybeShowCoach(): void {
    if (localStorage.getItem(HINT_KEY) === '1') return
    // Defer to the first-run walkthrough; show on a later launch instead of
    // stacking on top of it.
    if (localStorage.getItem(WALKTHROUGH_KEY) !== '1') return
    if (this.guides.length > 0) {
      localStorage.setItem(HINT_KEY, '1')
      return
    }
    this.coach.classList.add('show')
  }

  private dismissCoach(): void {
    if (!this.coach.classList.contains('show')) return
    this.coach.classList.remove('show')
    localStorage.setItem(HINT_KEY, '1')
  }

  private tool(
    label: string,
    icon: SVGSVGElement,
    onClick: () => void,
  ): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'g-tool'
    btn.setAttribute('aria-label', label)
    btn.appendChild(icon)
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick()
    })
    return btn
  }

  private toggleBar(): void {
    this.barOpen ? this.closeBar() : this.openBar()
  }

  private openBar(): void {
    this.barOpen = true
    this.bar.hidden = false
    this.controls.classList.add('open')
    this.dismissCoach()
  }

  private closeBar(): void {
    this.barOpen = false
    this.bar.hidden = true
    this.controls.classList.remove('open')
    this.cancelAdd()
  }

  private startAdd(mode: Mode): void {
    if (this.mode === mode) {
      this.cancelAdd()
      return
    }
    if (!this.visible) this.toggleVisible()
    this.deselect()
    this.mode = mode
    this.action = null
    this.overlay.classList.add('adding')
    this.hint.hidden = false
    this.hint.textContent =
      mode === 'add-line' ? 'Drag to draw a line' : 'Tap to place a point'
    this.updateToolState()
    this.render()
  }

  private cancelAdd(): void {
    if (this.mode === 'idle') return
    this.mode = 'idle'
    this.action = null
    this.overlay.classList.remove('adding')
    this.hint.hidden = true
    this.updateToolState()
    this.render()
  }

  private updateToolState(): void {
    this.bar
      .querySelector('.g-line-tool')
      ?.classList.toggle('active', this.mode === 'add-line')
    this.bar
      .querySelector('.g-point-tool')
      ?.classList.toggle('active', this.mode === 'add-point')
  }

  private onOverlayDown(event: PointerEvent): void {
    if (this.mode === 'idle') {
      if (this.selected !== null && event.target === this.svg) this.deselect()
      return
    }
    event.stopPropagation()
    const rect = this.svg.getBoundingClientRect()
    const px = event.clientX - rect.left
    const py = event.clientY - rect.top
    if (this.mode === 'add-point') {
      this.guides.push({
        type: 'point',
        x: px / rect.width,
        y: py / rect.height,
      })
      this.commit()
      this.cancelAdd()
      return
    }
    // add-line: press-drag-release
    this.action = {
      kind: 'draw',
      ax: px,
      ay: py,
      bx: px,
      by: py,
      snap: null,
      moved: false,
    }
    this.render()
  }

  private onGuideDown(event: PointerEvent, i: number): void {
    if (this.mode !== 'idle') return
    event.stopPropagation()
    this.select(i)
    this.action = {
      kind: 'move',
      startX: event.clientX,
      startY: event.clientY,
      orig: { ...this.guides[i] },
    }
  }

  private onHandleDown(event: PointerEvent, end: 'a' | 'b'): void {
    event.stopPropagation()
    this.action = { kind: 'end', end }
  }

  private onPointerMove(event: PointerEvent): void {
    const a = this.action
    if (!a) return
    const rect = this.svg.getBoundingClientRect()
    if (a.kind === 'draw') {
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      const s = snapLine(a.ax, a.ay, px, py)
      a.bx = s.bx
      a.by = s.by
      a.snap = s.snap
      if (Math.hypot(px - a.ax, py - a.ay) >= DRAW_MIN_PX) a.moved = true
      this.render()
      return
    }
    if (this.selected === null) return
    const g = this.guides[this.selected]
    if (a.kind === 'move') {
      const dxN = (event.clientX - a.startX) / rect.width
      const dyN = (event.clientY - a.startY) / rect.height
      const o = a.orig
      if (g.type === 'line' && o.type === 'line') {
        g.ax = o.ax + dxN
        g.ay = o.ay + dyN
        g.bx = o.bx + dxN
        g.by = o.by + dyN
      } else if (g.type === 'point' && o.type === 'point') {
        g.x = o.x + dxN
        g.y = o.y + dyN
      }
    } else if (g.type === 'line') {
      const mx = event.clientX - rect.left
      const my = event.clientY - rect.top
      const anchorX = (a.end === 'a' ? g.bx : g.ax) * rect.width
      const anchorY = (a.end === 'a' ? g.by : g.ay) * rect.height
      const s = snapLine(anchorX, anchorY, mx, my)
      if (a.end === 'a') {
        g.ax = s.bx / rect.width
        g.ay = s.by / rect.height
      } else {
        g.bx = s.bx / rect.width
        g.by = s.by / rect.height
      }
      g.snap = s.snap
    }
    this.render()
  }

  private onPointerUp(): void {
    const a = this.action
    if (!a) return
    this.action = null
    if (a.kind === 'draw') {
      if (a.moved) {
        const rect = this.svg.getBoundingClientRect()
        this.guides.push({
          type: 'line',
          ax: a.ax / rect.width,
          ay: a.ay / rect.height,
          bx: a.bx / rect.width,
          by: a.by / rect.height,
          snap: a.snap,
        })
        this.commit()
        this.cancelAdd()
      } else {
        // A tap with no drag: keep the tool armed, discard the stub.
        this.render()
      }
      return
    }
    saveGuides(this.guides)
  }

  private toggleVisible(): void {
    this.visible = !this.visible
    this.overlay.classList.toggle('hidden', !this.visible)
    this.eyeBtn.replaceChildren(this.visible ? eyeIcon() : eyeOffIcon())
    this.eyeBtn.setAttribute(
      'aria-label',
      this.visible ? 'Hide guides' : 'Show guides',
    )
  }

  private clear(): void {
    if (this.guides.length === 0) return
    this.guides = []
    this.selected = null
    this.overlay.classList.remove('has-selection')
    this.commit()
  }

  private commit(): void {
    saveGuides(this.guides)
    this.render()
  }

  private render(): void {
    const rect = this.svg.getBoundingClientRect()
    const w = rect.width || window.innerWidth
    const h = rect.height || window.innerHeight
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild)
    this.guides.forEach((g, i) => {
      this.svg.appendChild(this.guideEl(g, i, w, h))
    })
    const a = this.action
    if (a?.kind === 'draw' && a.moved) {
      this.svg.appendChild(
        this.lineSeg('g-draw g-line', a.ax, a.ay, a.bx, a.by, a.snap != null),
      )
      this.svg.appendChild(this.pointDraw(a.ax, a.ay, true))
      this.svg.appendChild(this.pointDraw(a.bx, a.by, true))
    }
    this.positionDelete(rect, w, h)
  }

  private guideEl(g: Guide, i: number, w: number, h: number): SVGGElement {
    const group = document.createElementNS(SVG_NS, 'g')
    const selected = i === this.selected
    group.setAttribute('class', selected ? 'g-guide selected' : 'g-guide')
    if (g.type === 'line') {
      const x1 = g.ax * w
      const y1 = g.ay * h
      const x2 = g.bx * w
      const y2 = g.by * h
      group.appendChild(this.lineSeg('g-hit', x1, y1, x2, y2, g.snap != null))
      group.appendChild(
        this.lineSeg('g-draw g-line', x1, y1, x2, y2, g.snap != null),
      )
      if (selected) {
        group.appendChild(this.handle(x1, y1, 'a'))
        group.appendChild(this.handle(x2, y2, 'b'))
      }
    } else {
      const cx = g.x * w
      const cy = g.y * h
      group.appendChild(this.pointHit(cx, cy))
      group.appendChild(this.pointDraw(cx, cy))
    }
    const hit = group.querySelector<SVGElement>('.g-hit')
    hit?.addEventListener('pointerdown', (e) =>
      this.onGuideDown(e as PointerEvent, i),
    )
    return group
  }

  private lineSeg(
    cls: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    snapped: boolean,
  ): SVGLineElement {
    const line = document.createElementNS(SVG_NS, 'line')
    line.setAttribute('class', snapped ? `${cls} snapped` : cls)
    line.setAttribute('x1', String(x1))
    line.setAttribute('y1', String(y1))
    line.setAttribute('x2', String(x2))
    line.setAttribute('y2', String(y2))
    return line
  }

  private handle(cx: number, cy: number, end: 'a' | 'b'): SVGCircleElement {
    const c = document.createElementNS(SVG_NS, 'circle')
    c.setAttribute('class', 'g-handle')
    c.setAttribute('cx', String(cx))
    c.setAttribute('cy', String(cy))
    c.setAttribute('r', '11')
    c.addEventListener('pointerdown', (e) =>
      this.onHandleDown(e as PointerEvent, end),
    )
    return c
  }

  private pointHit(cx: number, cy: number): SVGCircleElement {
    const c = document.createElementNS(SVG_NS, 'circle')
    c.setAttribute('class', 'g-hit')
    c.setAttribute('cx', String(cx))
    c.setAttribute('cy', String(cy))
    c.setAttribute('r', '18')
    return c
  }

  private pointDraw(cx: number, cy: number, pending = false): SVGCircleElement {
    const c = document.createElementNS(SVG_NS, 'circle')
    c.setAttribute(
      'class',
      pending ? 'g-draw g-point pending' : 'g-draw g-point',
    )
    c.setAttribute('cx', String(cx))
    c.setAttribute('cy', String(cy))
    c.setAttribute('r', '6')
    return c
  }

  private positionDelete(rect: DOMRect, w: number, h: number): void {
    if (this.selected === null || this.selected >= this.guides.length) {
      this.deleteBtn.hidden = true
      return
    }
    const g = this.guides[this.selected]
    // Pin to the top-right corner of the guide's bounding box, viewport-clamped.
    const maxX = g.type === 'line' ? Math.max(g.ax, g.bx) * w : g.x * w
    const minY = g.type === 'line' ? Math.min(g.ay, g.by) * h : g.y * h
    const cx = clamp(rect.left + maxX + 20, 24, window.innerWidth - 24)
    const cy = clamp(rect.top + minY - 20, 24, window.innerHeight - 24)
    this.deleteBtn.style.left = `${cx}px`
    this.deleteBtn.style.top = `${cy}px`
    this.deleteBtn.hidden = false
  }

  private select(i: number): void {
    this.selected = i
    this.overlay.classList.add('has-selection')
    this.render()
  }

  private deselect(): void {
    if (this.selected === null) return
    this.selected = null
    this.overlay.classList.remove('has-selection')
    this.render()
  }

  private deleteSelected(): void {
    if (this.selected === null) return
    this.guides.splice(this.selected, 1)
    this.selected = null
    this.overlay.classList.remove('has-selection')
    this.commit()
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

import { snapLine } from './guideGeometry'
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

type Mode = 'idle' | 'add-line' | 'add-point'

export class Guides {
  private readonly overlay: HTMLDivElement
  private readonly svg: SVGSVGElement
  private readonly controls: HTMLDivElement
  private readonly bar: HTMLDivElement
  private readonly hint: HTMLDivElement
  private readonly eyeBtn: HTMLButtonElement

  private guides: Guide[]
  private mode: Mode = 'idle'
  private barOpen = false
  private visible = true
  private pendingA: { x: number; y: number } | null = null

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

    this.controls.append(this.hint, button, this.bar)

    parent.append(this.overlay, this.controls)

    window.addEventListener('resize', () => this.render())
    this.render()
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
    this.mode = mode
    this.pendingA = null
    this.overlay.classList.add('adding')
    this.hint.hidden = false
    this.hint.textContent =
      mode === 'add-line' ? 'Tap two points' : 'Tap to place a point'
    this.render()
  }

  private cancelAdd(): void {
    if (this.mode === 'idle') return
    this.mode = 'idle'
    this.pendingA = null
    this.overlay.classList.remove('adding')
    this.hint.hidden = true
    this.render()
  }

  private onOverlayDown(event: PointerEvent): void {
    if (this.mode === 'idle') return
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
    // add-line: two taps
    if (!this.pendingA) {
      this.pendingA = { x: px, y: py }
      this.render()
      return
    }
    const { bx, by, snap } = snapLine(this.pendingA.x, this.pendingA.y, px, py)
    this.guides.push({
      type: 'line',
      ax: this.pendingA.x / rect.width,
      ay: this.pendingA.y / rect.height,
      bx: bx / rect.width,
      by: by / rect.height,
      snap,
    })
    this.commit()
    this.cancelAdd()
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
    for (const g of this.guides) {
      if (g.type === 'line') {
        this.svg.appendChild(
          this.lineEl(g.ax * w, g.ay * h, g.bx * w, g.by * h, g.snap != null),
        )
      } else {
        this.svg.appendChild(this.pointEl(g.x * w, g.y * h))
      }
    }
    if (this.pendingA) {
      this.svg.appendChild(this.pointEl(this.pendingA.x, this.pendingA.y, true))
    }
  }

  private lineEl(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    snapped: boolean,
  ): SVGLineElement {
    const line = document.createElementNS(SVG_NS, 'line')
    line.setAttribute(
      'class',
      snapped ? 'g-draw g-line snapped' : 'g-draw g-line',
    )
    line.setAttribute('x1', String(x1))
    line.setAttribute('y1', String(y1))
    line.setAttribute('x2', String(x2))
    line.setAttribute('y2', String(y2))
    return line
  }

  private pointEl(cx: number, cy: number, pending = false): SVGCircleElement {
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
}

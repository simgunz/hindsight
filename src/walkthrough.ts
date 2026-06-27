const SVG_NS = 'http://www.w3.org/2000/svg'

type CueKind = 'welcome' | 'setup' | 'swipe' | 'double' | 'tap' | 'drag'

interface CardSpec {
  kind: CueKind
  title: string
  sub: string
}

const CARDS: CardSpec[] = [
  {
    kind: 'welcome',
    title: 'Hindsight',
    sub: 'A mirror on a delay. See your own form, seconds after.',
  },
  {
    kind: 'setup',
    title: 'Prop it a few meters away',
    sub: 'Then step into frame.',
  },
  {
    kind: 'swipe',
    title: 'Swipe up',
    sub: 'Set the delay and your presets.',
  },
  {
    kind: 'double',
    title: 'Double-tap',
    sub: 'Jump between live and your delay.',
  },
  {
    kind: 'tap',
    title: 'Tap',
    sub: 'Pause on a moment, tap again to resume.',
  },
  {
    kind: 'drag',
    title: 'Drag',
    sub: 'Rewind to any moment and replay from there.',
  },
]

const CLOSE_MS = 300

export class Walkthrough {
  readonly element: HTMLDivElement
  private readonly cards: HTMLDivElement[] = []
  private readonly dots: HTMLDivElement[] = []
  private readonly nextBtn: HTMLButtonElement
  private readonly onDone: () => void
  private index = 0
  private closeTimer = 0

  constructor(onDone: () => void) {
    this.onDone = onDone

    const root = document.createElement('div')
    root.className = 'walkthrough'
    root.hidden = true

    const skip = document.createElement('button')
    skip.type = 'button'
    skip.className = 'wt-skip'
    skip.textContent = 'Skip'
    skip.addEventListener('click', (event) => {
      event.stopPropagation()
      this.close()
    })

    const stage = document.createElement('div')
    stage.className = 'wt-stage'
    for (const spec of CARDS) {
      const card = this.buildCard(spec)
      this.cards.push(card)
      stage.append(card)
    }

    const dots = document.createElement('div')
    dots.className = 'wt-dots'
    for (let i = 0; i < CARDS.length; i++) {
      const dot = document.createElement('div')
      dot.className = 'wt-dot'
      this.dots.push(dot)
      dots.append(dot)
    }

    const next = document.createElement('button')
    next.type = 'button'
    next.className = 'wt-next'
    next.addEventListener('click', (event) => {
      event.stopPropagation()
      this.advance()
    })
    this.nextBtn = next

    root.append(skip, stage, dots, next)
    root.addEventListener('click', () => this.advance())
    this.element = root
  }

  show(): void {
    window.clearTimeout(this.closeTimer)
    this.index = 0
    this.render()
    this.element.hidden = false
    void this.element.offsetWidth
    this.element.classList.add('shown')
  }

  private render(): void {
    this.cards.forEach((card, i) => {
      card.classList.toggle('active', i === this.index)
    })
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('on', i === this.index)
    })
    this.nextBtn.textContent =
      this.index === CARDS.length - 1 ? 'Got it' : 'Next'
  }

  private advance(): void {
    if (this.index < CARDS.length - 1) {
      this.index += 1
      this.render()
    } else {
      this.close()
    }
  }

  private close(): void {
    this.element.classList.remove('shown')
    this.closeTimer = window.setTimeout(() => {
      this.element.hidden = true
      this.onDone()
    }, CLOSE_MS)
  }

  private buildCard(spec: CardSpec): HTMLDivElement {
    const card = document.createElement('div')
    card.className = 'wt-card'
    card.append(this.buildCue(spec.kind))

    const title = document.createElement('div')
    title.className = spec.kind === 'setup' ? 'wt-title' : 'wt-title accent'
    title.textContent = spec.title

    const sub = document.createElement('div')
    sub.className = 'wt-sub'
    sub.textContent = spec.sub

    card.append(title, sub)
    return card
  }

  private buildCue(kind: CueKind): HTMLDivElement {
    const cue = document.createElement('div')
    cue.className = `wt-cue wt-${kind}`
    if (kind === 'setup') {
      cue.append(this.setupArt())
      return cue
    }
    if (kind === 'swipe') cue.append(this.arrow('up'))
    if (kind === 'drag') cue.append(this.arrow('left'), this.arrow('right'))
    const touch = document.createElement('div')
    touch.className = 'wt-touch'
    cue.append(touch)
    return cue
  }

  private arrow(dir: 'up' | 'left' | 'right'): HTMLDivElement {
    const arrow = document.createElement('div')
    arrow.className = `wt-arrow ${dir}`
    arrow.textContent = dir === 'up' ? '▲' : dir === 'left' ? '◀' : '▶'
    return arrow
  }

  private setupArt(): SVGSVGElement {
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', '0 0 64 44')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '2')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')
    svg.setAttribute('aria-hidden', 'true')

    const phone = document.createElementNS(SVG_NS, 'rect')
    phone.setAttribute('x', '7')
    phone.setAttribute('y', '9')
    phone.setAttribute('width', '13')
    phone.setAttribute('height', '26')
    phone.setAttribute('rx', '2.5')

    const stand = document.createElementNS(SVG_NS, 'path')
    stand.setAttribute('d', 'M13.5 35v5 M9 40h9')

    const head = document.createElementNS(SVG_NS, 'circle')
    head.setAttribute('cx', '48')
    head.setAttribute('cy', '13')
    head.setAttribute('r', '3.5')

    const body = document.createElementNS(SVG_NS, 'path')
    body.setAttribute('d', 'M48 17v10 M42 21h12 M48 27l-4 8 M48 27l4 8')

    const dist = document.createElementNS(SVG_NS, 'path')
    dist.setAttribute('d', 'M23 24h17')
    dist.setAttribute('stroke-dasharray', '2 3')
    dist.setAttribute('opacity', '0.45')

    svg.append(phone, stand, dist, head, body)
    return svg
  }
}

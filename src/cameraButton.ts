const SVG_NS = 'http://www.w3.org/2000/svg'

const ICON_PATHS = [
  'M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5',
  'M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5',
  'm18 22-3-3 3-3',
  'm6 2 3 3-3 3',
]

export class CameraButton {
  readonly element: HTMLButtonElement

  constructor(onToggle: () => void) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'camera-btn'
    button.setAttribute('aria-label', 'Switch camera')

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '2')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')
    svg.setAttribute('aria-hidden', 'true')

    for (const d of ICON_PATHS) {
      const path = document.createElementNS(SVG_NS, 'path')
      path.setAttribute('d', d)
      svg.appendChild(path)
    }

    const lens = document.createElementNS(SVG_NS, 'circle')
    lens.setAttribute('cx', '12')
    lens.setAttribute('cy', '12')
    lens.setAttribute('r', '3')
    svg.appendChild(lens)

    button.appendChild(svg)
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      onToggle()
    })

    this.element = button
  }
}

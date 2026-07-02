const SVG_NS = 'http://www.w3.org/2000/svg'

function strokeIcon(paths: string[]): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '2')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('aria-hidden', 'true')
  for (const d of paths) {
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', d)
    svg.appendChild(path)
  }
  return svg
}

function circle(svg: SVGSVGElement, cx: number, cy: number, r: number): void {
  const el = document.createElementNS(SVG_NS, 'circle')
  el.setAttribute('cx', String(cx))
  el.setAttribute('cy', String(cy))
  el.setAttribute('r', String(r))
  svg.appendChild(el)
}

export function cameraFlipIcon(): SVGSVGElement {
  const svg = strokeIcon([
    'M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5',
    'M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5',
    'm18 22-3-3 3-3',
    'm6 2 3 3-3 3',
  ])
  circle(svg, 12, 12, 3)
  return svg
}

export function helpIcon(): SVGSVGElement {
  const svg = strokeIcon(['M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'])
  circle(svg, 12, 12, 10)
  return svg
}

export function backIcon(): SVGSVGElement {
  return strokeIcon(['m15 18-6-6 6-6'])
}

export function chevronUpIcon(): SVGSVGElement {
  return strokeIcon(['m6 15 6-6 6 6'])
}

export function replayIcon(): SVGSVGElement {
  return strokeIcon([
    'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8',
    'M3 3v5h5',
  ])
}

export function guidesIcon(): SVGSVGElement {
  const svg = strokeIcon(['M12 3v18', 'M3 12h18'])
  circle(svg, 12, 12, 3)
  return svg
}

export function lineIcon(): SVGSVGElement {
  const svg = strokeIcon(['M5 19 19 5'])
  circle(svg, 5, 19, 1.8)
  circle(svg, 19, 5, 1.8)
  return svg
}

export function pointIcon(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'currentColor')
  svg.setAttribute('aria-hidden', 'true')
  const dot = document.createElementNS(SVG_NS, 'circle')
  dot.setAttribute('cx', '12')
  dot.setAttribute('cy', '12')
  dot.setAttribute('r', '4')
  svg.appendChild(dot)
  return svg
}

export function eyeIcon(): SVGSVGElement {
  const svg = strokeIcon(['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z'])
  circle(svg, 12, 12, 3)
  return svg
}

export function eyeOffIcon(): SVGSVGElement {
  return strokeIcon([
    'M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-2.16 3.19',
    'M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 8 10 8a9.1 9.1 0 0 0 3.4-.66',
    'M3 3l18 18',
  ])
}

export function trashIcon(): SVGSVGElement {
  return strokeIcon([
    'M3 6h18',
    'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
  ])
}

export function closeIcon(): SVGSVGElement {
  return strokeIcon(['M18 6 6 18', 'M6 6l12 12'])
}

export function pauseIcon(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'currentColor')
  svg.setAttribute('aria-hidden', 'true')
  for (const x of [7, 14]) {
    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('x', String(x))
    rect.setAttribute('y', '5')
    rect.setAttribute('width', '3')
    rect.setAttribute('height', '14')
    rect.setAttribute('rx', '1')
    svg.appendChild(rect)
  }
  return svg
}

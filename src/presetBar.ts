import type { Preset } from './presetStore'

export class PresetBar {
  readonly element: HTMLDivElement
  private readonly onApply: (seconds: number) => void
  private chips: { el: HTMLButtonElement; seconds: number }[] = []

  constructor(onApply: (seconds: number) => void) {
    this.onApply = onApply
    const element = document.createElement('div')
    element.className = 'preset-bar'
    this.element = element
  }

  setPresets(presets: Preset[]): void {
    this.chips = presets.map((preset) => ({
      el: this.makeChip(preset),
      seconds: preset.seconds,
    }))
    this.element.replaceChildren(...this.chips.map((chip) => chip.el))
  }

  updateActive(seconds: number): void {
    for (const chip of this.chips) {
      chip.el.classList.toggle('active', chip.seconds === seconds)
    }
  }

  private makeChip(preset: Preset): HTMLButtonElement {
    const chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'preset-chip'

    if (preset.label) {
      const label = document.createElement('span')
      label.className = 'preset-label'
      label.textContent = preset.label
      chip.append(label, this.delaySpan(preset.seconds, false))
    } else {
      chip.append(this.delaySpan(preset.seconds, true))
    }

    chip.addEventListener('click', () => this.onApply(preset.seconds))
    return chip
  }

  private delaySpan(seconds: number, solo: boolean): HTMLSpanElement {
    const delay = document.createElement('span')
    delay.className = solo ? 'preset-delay solo' : 'preset-delay'
    delay.textContent = String(seconds)
    const affix = document.createElement('span')
    affix.className = 'preset-affix'
    affix.textContent = 's'
    delay.append(affix)
    return delay
  }
}

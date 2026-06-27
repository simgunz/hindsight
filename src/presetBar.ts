import type { Preset } from './presetStore'

export class PresetBar {
  readonly element: HTMLDivElement
  private readonly onApply: (seconds: number) => void
  private readonly onAdd: (label: string) => void
  private chips: { el: HTMLButtonElement; seconds: number }[] = []
  private currentSeconds = 0

  constructor(
    onApply: (seconds: number) => void,
    onAdd: (label: string) => void,
  ) {
    this.onApply = onApply
    this.onAdd = onAdd
    const element = document.createElement('div')
    element.className = 'preset-bar'
    this.element = element
  }

  setPresets(presets: Preset[]): void {
    this.chips = presets.map((preset) => ({
      el: this.makeChip(preset),
      seconds: preset.seconds,
    }))
    this.renderChips()
  }

  updateActive(seconds: number): void {
    this.currentSeconds = seconds
    for (const chip of this.chips) {
      chip.el.classList.toggle('active', chip.seconds === seconds)
    }
  }

  private renderChips(): void {
    this.element.replaceChildren(
      ...this.chips.map((chip) => chip.el),
      this.makeAddChip(),
    )
  }

  private makeAddChip(): HTMLButtonElement {
    const chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'preset-chip add'
    chip.setAttribute('aria-label', 'Add preset')
    chip.textContent = '+'
    chip.addEventListener('click', () => this.enterAdd())
    return chip
  }

  private enterAdd(): void {
    const form = document.createElement('div')
    form.className = 'preset-add'

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'preset-input'
    input.placeholder = 'Label, optional'
    input.maxLength = 16

    const save = document.createElement('button')
    save.type = 'button'
    save.className = 'preset-save'
    save.textContent = `Save ${this.currentSeconds}s`

    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.className = 'preset-cancel'
    cancel.setAttribute('aria-label', 'Cancel')
    cancel.textContent = '✕'

    const commit = (): void => this.onAdd(input.value.trim())
    save.addEventListener('click', commit)
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') commit()
    })
    cancel.addEventListener('click', () => this.renderChips())

    form.append(input, save, cancel)
    this.element.replaceChildren(form)
    input.focus()
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

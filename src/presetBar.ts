import type { Preset } from './presetStore'

const LONG_PRESS_MS = 500
const MOVE_CANCEL_PX = 10

export class PresetBar {
  readonly element: HTMLDivElement
  private readonly onApply: (seconds: number) => void
  private readonly onAdd: (label: string) => void
  private readonly onDelete: (index: number) => void
  private chips: { el: HTMLButtonElement; preset: Preset }[] = []
  private currentSeconds = 0
  private confirmingIndex = -1
  private outsideTap: ((event: PointerEvent) => void) | null = null

  constructor(
    onApply: (seconds: number) => void,
    onAdd: (label: string) => void,
    onDelete: (index: number) => void,
  ) {
    this.onApply = onApply
    this.onAdd = onAdd
    this.onDelete = onDelete
    const element = document.createElement('div')
    element.className = 'preset-bar'
    this.element = element
  }

  setPresets(presets: Preset[]): void {
    this.detachOutside()
    this.confirmingIndex = -1
    this.chips = presets.map((preset, index) => ({
      el: this.makeChip(preset, index),
      preset,
    }))
    this.showChips()
    this.updateActive(this.currentSeconds)
  }

  updateActive(seconds: number): void {
    this.currentSeconds = seconds
    this.chips.forEach((chip, index) => {
      chip.el.classList.toggle(
        'active',
        index !== this.confirmingIndex && chip.preset.seconds === seconds,
      )
    })
  }

  private showChips(): void {
    this.element.replaceChildren(
      ...this.chips.map((chip) => chip.el),
      this.makeAddChip(),
    )
  }

  private makeChip(preset: Preset, index: number): HTMLButtonElement {
    const chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'preset-chip'
    this.fillChip(chip, preset)

    let startX = 0
    let startY = 0
    let moved = false
    let longPressed = false
    let timer = 0
    chip.addEventListener('pointerdown', (event) => {
      startX = event.clientX
      startY = event.clientY
      moved = false
      longPressed = false
      timer = window.setTimeout(() => {
        longPressed = true
        this.confirm(index)
      }, LONG_PRESS_MS)
    })
    chip.addEventListener('pointermove', (event) => {
      if (
        Math.hypot(event.clientX - startX, event.clientY - startY) >
        MOVE_CANCEL_PX
      ) {
        moved = true
        window.clearTimeout(timer)
      }
    })
    chip.addEventListener('pointercancel', () => {
      moved = true
      window.clearTimeout(timer)
    })
    chip.addEventListener('pointerup', () => {
      window.clearTimeout(timer)
      if (moved || longPressed) return
      if (this.confirmingIndex === index) {
        this.commitDelete(index)
      } else if (this.confirmingIndex !== -1) {
        this.cancelConfirm()
      } else {
        this.onApply(preset.seconds)
      }
    })
    return chip
  }

  private fillChip(chip: HTMLButtonElement, preset: Preset): void {
    if (preset.label) {
      const label = document.createElement('span')
      label.className = 'preset-label'
      label.textContent = preset.label
      chip.replaceChildren(label, this.delaySpan(preset.seconds, false))
    } else {
      chip.replaceChildren(this.delaySpan(preset.seconds, true))
    }
  }

  private confirm(index: number): void {
    this.confirmingIndex = index
    const chip = this.chips[index]?.el
    if (!chip) return
    chip.classList.remove('active')
    chip.classList.add('confirming')
    chip.replaceChildren(document.createTextNode('✕ remove'))
    this.outsideTap = (event) => {
      if (event.target instanceof Node && this.element.contains(event.target))
        return
      this.cancelConfirm()
    }
    document.addEventListener('pointerdown', this.outsideTap, true)
  }

  private cancelConfirm(): void {
    const index = this.confirmingIndex
    this.confirmingIndex = -1
    this.detachOutside()
    const entry = this.chips[index]
    if (entry) {
      entry.el.classList.remove('confirming')
      this.fillChip(entry.el, entry.preset)
    }
    this.updateActive(this.currentSeconds)
  }

  private commitDelete(index: number): void {
    this.detachOutside()
    this.confirmingIndex = -1
    this.onDelete(index)
  }

  private detachOutside(): void {
    if (this.outsideTap) {
      document.removeEventListener('pointerdown', this.outsideTap, true)
      this.outsideTap = null
    }
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
    if (this.confirmingIndex !== -1) this.cancelConfirm()

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
    cancel.addEventListener('click', () => this.showChips())

    form.append(input, save, cancel)
    this.element.replaceChildren(form)
    input.focus()
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

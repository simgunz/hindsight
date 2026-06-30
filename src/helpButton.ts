import { helpIcon } from './icons'

export class HelpButton {
  readonly element: HTMLButtonElement

  constructor(onOpen: () => void) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'help-btn'
    button.setAttribute('aria-label', 'How it works')
    button.appendChild(helpIcon())
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      onOpen()
    })
    this.element = button
  }
}

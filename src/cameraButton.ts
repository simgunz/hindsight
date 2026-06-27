import { cameraFlipIcon } from './icons'

export class CameraButton {
  readonly element: HTMLButtonElement

  constructor(onToggle: () => void) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'camera-btn'
    button.setAttribute('aria-label', 'Switch camera')
    button.appendChild(cameraFlipIcon())
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      onToggle()
    })
    this.element = button
  }
}

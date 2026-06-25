import './style.css'
import { DelayIndicator } from './delayIndicator'
import { DelayPipeline, pickCodec } from './delayPipeline'
import { loadDelaySeconds, saveDelaySeconds } from './delayStore'
import { DelayWheel } from './delayWheel'
import { createFrameSource } from './frameSource'
import { SettingsSheet } from './settingsSheet'
import { StatsOverlay } from './stats'

const DEFAULT_DELAY_SECONDS = 10
const FRAMERATE = 30
const BITRATE = 3_000_000
const KEY_FRAME_INTERVAL = 60

const DEBUG = new URLSearchParams(window.location.search).has('debug')

interface CardAction {
  label: string
  onClick: () => void
}

function renderCard(
  parent: HTMLElement,
  title: string,
  body: string,
  action?: CardAction,
): void {
  parent.replaceChildren()
  const card = document.createElement('div')
  card.className = 'card'

  const heading = document.createElement('h1')
  heading.textContent = title
  const text = document.createElement('p')
  text.textContent = body
  card.append(heading, text)

  if (action) {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = action.label
    button.addEventListener('click', action.onClick)
    card.append(button)
  }

  parent.append(card)
}

function renderMessage(parent: HTMLElement, text: string): void {
  const message = document.createElement('p')
  message.className = 'message'
  message.textContent = text
  parent.append(message)
}

async function requestWakeLock(): Promise<void> {
  if (!navigator.wakeLock) return
  await navigator.wakeLock.request('screen').catch(() => undefined)
}

async function startMirror(app: HTMLElement): Promise<void> {
  app.replaceChildren()
  renderMessage(app, 'Starting camera…')

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: FRAMERATE },
      },
      audio: false,
    })
  } catch (error) {
    if ((error as Error).name === 'NotAllowedError') {
      renderCard(
        app,
        'Camera blocked',
        'Hindsight needs the camera to mirror you. Enable camera access for this site in your browser settings, then reload.',
        { label: 'Reload', onClick: () => window.location.reload() },
      )
    } else {
      renderCard(app, 'Camera unavailable', (error as Error).message, {
        label: 'Try again',
        onClick: () => void startMirror(app),
      })
    }
    return
  }

  const track = stream.getVideoTracks()[0]
  if (!track) {
    renderCard(app, 'No camera', 'No camera track is available on this device.')
    return
  }

  const settings = track.getSettings()
  const width = settings.width ?? 1280
  const height = settings.height ?? 720

  let codec: string
  try {
    codec = await pickCodec(width, height, FRAMERATE, BITRATE)
  } catch (error) {
    renderCard(app, 'Unsupported video', (error as Error).message)
    return
  }

  app.replaceChildren()
  const canvas = document.createElement('canvas')
  canvas.className = 'viewport'
  app.append(canvas)

  const indicator = new DelayIndicator()
  app.append(indicator.element)

  let warming: HTMLParagraphElement | null = document.createElement('p')
  warming.className = 'message'
  warming.textContent = 'Starting camera…'
  app.append(warming)

  const overlay = DEBUG ? new StatsOverlay() : null
  if (overlay) app.append(overlay.element)

  let currentSeconds = loadDelaySeconds(DEFAULT_DELAY_SECONDS)
  let baseDelayMs = currentSeconds * 1000

  const pipeline = new DelayPipeline({
    canvas,
    codec,
    width,
    height,
    framerate: FRAMERATE,
    bitrate: BITRATE,
    baseDelayMs,
    keyFrameInterval: KEY_FRAME_INTERVAL,
  })
  pipeline.start()
  if (DEBUG) Reflect.set(window, 'hindsightPipeline', pipeline)

  const wheel = new DelayWheel((seconds) => {
    currentSeconds = seconds
    baseDelayMs = seconds * 1000
    pipeline.setBaseDelay(baseDelayMs)
    saveDelaySeconds(seconds)
  })
  const sheet = new SettingsSheet(wheel)
  app.append(sheet.element)

  attachOpenGesture(canvas, () => {
    wheel.setValue(currentSeconds)
    sheet.open()
  })

  const source = createFrameSource(track)
  source.start((frame) => {
    pipeline.encode(frame)
    frame.close()
  })

  void requestWakeLock()

  setInterval(() => {
    const stats = pipeline.getStats()
    indicator.update(stats.effectiveDelayMs, baseDelayMs)
    overlay?.update(stats, codec)
    if (warming && stats.displayedFps > 0) {
      warming.remove()
      warming = null
    }
  }, 250)
}

function attachOpenGesture(target: HTMLElement, onSwipeUp: () => void): void {
  let startX = 0
  let startY = 0
  let tracking = false
  target.addEventListener('pointerdown', (event) => {
    startX = event.clientX
    startY = event.clientY
    tracking = true
  })
  target.addEventListener('pointerup', (event) => {
    if (!tracking) return
    tracking = false
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    if (dy < -60 && Math.abs(dy) > Math.abs(dx)) onSwipeUp()
  })
}

function main(): void {
  const app = document.querySelector<HTMLDivElement>('#app')
  if (!app) throw new Error('Missing #app root element')

  if (!('VideoEncoder' in window)) {
    renderCard(
      app,
      'Not supported',
      'This browser lacks the WebCodecs support Hindsight needs. Try a recent Chrome on Android or Safari on iPhone.',
    )
    return
  }

  renderCard(
    app,
    'Hindsight',
    'See yourself on a delay, hands-free. The camera runs while the app is open, but nothing is ever recorded or saved.',
    { label: 'Start mirror', onClick: () => void startMirror(app) },
  )
}

main()

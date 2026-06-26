import '@fontsource/martian-mono/300.css'
import '@fontsource/martian-mono/400.css'
import '@fontsource/martian-mono/600.css'
import './style.css'
import { BuildOverlay } from './buildOverlay'
import { DelayIndicator } from './delayIndicator'
import { DelayPipeline, pickCodec } from './delayPipeline'
import { loadDelaySeconds, saveDelaySeconds } from './delayStore'
import { DelayWheel } from './delayWheel'
import { createFrameSource } from './frameSource'
import { registerPwa } from './pwa'
import { SeekBar } from './seekBar'
import { SettingsSheet } from './settingsSheet'
import { StatsOverlay } from './stats'

const DEFAULT_DELAY_SECONDS = 10
const FRAMERATE = 30
const BITRATE = 3_000_000
const KEY_FRAME_INTERVAL = 60

const DEBUG = new URLSearchParams(window.location.search).has('debug')
const STARTED_KEY = 'hindsight.cameraStarted'

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

  localStorage.setItem(STARTED_KEY, '1')

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

  const buildOverlay = new BuildOverlay()
  app.append(buildOverlay.element)

  const seekBar = new SeekBar()
  app.append(seekBar.element)

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

  attachTap(canvas, () => {
    pipeline.togglePause()
  })

  attachScrub(canvas, {
    begin: () => pipeline.beginScrub(),
    move: (deltaMs) => pipeline.scrubBy(deltaMs),
    end: () => pipeline.endScrub(),
  })

  const source = createFrameSource(track)
  source.start((frame) => {
    pipeline.encode(frame)
    frame.close()
  })

  void requestWakeLock()

  const drive = (): void => {
    const state = pipeline.getDelayState()
    buildOverlay.sync(state.baseDelayMs, state.availableMs)
    indicator.update(state.effectiveDelayMs, state.baseDelayMs, state.paused)
    seekBar.sync(
      state.scrubbing,
      state.effectiveDelayMs,
      state.baseDelayMs,
      state.availableMs,
    )
    requestAnimationFrame(drive)
  }
  requestAnimationFrame(drive)

  setInterval(() => {
    const stats = pipeline.getStats()
    overlay?.update(stats, codec)
    if (warming && stats.displayedFps > 0) {
      warming.remove()
      warming = null
    }
  }, 250)
}

const TAP_MOVE_PX = 10
const TAP_MAX_MS = 300
const SCRUB_ACTIVATE_PX = 12
const SCRUB_SECONDS_PER_WIDTH = 20

interface ScrubHandlers {
  begin: () => void
  move: (deltaMs: number) => void
  end: () => void
}

function attachScrub(target: HTMLElement, handlers: ScrubHandlers): void {
  let active = false
  let scrubbing = false
  let startX = 0
  let startY = 0
  target.addEventListener('pointerdown', (event) => {
    active = true
    scrubbing = false
    startX = event.clientX
    startY = event.clientY
  })
  target.addEventListener('pointermove', (event) => {
    if (!active) return
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    if (!scrubbing) {
      if (Math.hypot(dx, dy) < SCRUB_ACTIVATE_PX) return
      if (Math.abs(dx) <= Math.abs(dy)) {
        active = false
        return
      }
      scrubbing = true
      handlers.begin()
    }
    const msPerPx = (SCRUB_SECONDS_PER_WIDTH * 1000) / window.innerWidth
    handlers.move(dx * msPerPx)
  })
  const finish = (): void => {
    if (scrubbing) handlers.end()
    active = false
    scrubbing = false
  }
  target.addEventListener('pointerup', finish)
  target.addEventListener('pointercancel', finish)
}

function attachTap(target: HTMLElement, onTap: () => void): void {
  let startX = 0
  let startY = 0
  let startT = 0
  let tracking = false
  target.addEventListener('pointerdown', (event) => {
    startX = event.clientX
    startY = event.clientY
    startT = event.timeStamp
    tracking = true
  })
  target.addEventListener('pointerup', (event) => {
    if (!tracking) return
    tracking = false
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    const dt = event.timeStamp - startT
    if (Math.hypot(dx, dy) <= TAP_MOVE_PX && dt <= TAP_MAX_MS) onTap()
  })
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

async function cameraPermissionState(): Promise<
  'granted' | 'prompt' | 'denied' | 'unknown'
> {
  if (!navigator.permissions?.query) return 'unknown'
  try {
    const status = await navigator.permissions.query({
      name: 'camera' as PermissionName,
    })
    return status.state
  } catch {
    return 'unknown'
  }
}

async function boot(app: HTMLElement): Promise<void> {
  const state = await cameraPermissionState()
  const startedBefore = localStorage.getItem(STARTED_KEY) === '1'

  if (state === 'granted' || (state === 'unknown' && startedBefore)) {
    await startMirror(app)
    return
  }

  if (state === 'denied') {
    renderCard(
      app,
      'Camera blocked',
      'Hindsight needs the camera to mirror you. Enable camera access for this site in your browser settings, then reload.',
      { label: 'Reload', onClick: () => window.location.reload() },
    )
    return
  }

  renderCard(
    app,
    'Hindsight',
    'See yourself on a delay, hands-free. Video stays on your device, in memory only. Nothing is saved or sent anywhere, and it clears the moment you close the app.',
    { label: 'Start mirror', onClick: () => void startMirror(app) },
  )
}

function main(): void {
  registerPwa()

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

  void boot(app)
}

main()

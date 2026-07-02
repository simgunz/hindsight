import '@fontsource/martian-mono/300.css'
import '@fontsource/martian-mono/400.css'
import '@fontsource/martian-mono/600.css'
import './style.css'
import { BuildOverlay } from './buildOverlay'
import { CameraButton } from './cameraButton'
import { DelayIndicator } from './delayIndicator'
import { DelayPipeline, pickCodec } from './delayPipeline'
import { loadDelaySeconds, saveDelaySeconds } from './delayStore'
import { DelayWheel } from './delayWheel'
import { createFrameNormalizer } from './frameNormalizer'
import { createFrameSource, type FrameSource } from './frameSource'
import { Guides } from './guides'
import { HelpButton } from './helpButton'
import { chevronUpIcon } from './icons'
import { PresetBar } from './presetBar'
import { loadPresets, savePresets } from './presetStore'
import { registerPwa } from './pwa'
import { SeekBar } from './seekBar'
import { SettingsSheet } from './settingsSheet'
import { StatsOverlay } from './stats'
import { Walkthrough } from './walkthrough'

const DEFAULT_DELAY_SECONDS = 20
const REBUFFER_AFTER_HIDDEN_MS = 1500
const FRAMERATE = 30
const BITRATE = 3_000_000
const KEY_FRAME_INTERVAL = 60

const DEBUG = new URLSearchParams(window.location.search).has('debug')
const STARTED_KEY = 'hindsight.cameraStarted'
const WALKTHROUGH_KEY = 'hindsight.walkthroughSeen'

interface CardAction {
  label: string
  onClick: () => void
}

interface CardOptions {
  accentTitle?: boolean
  motto?: string
}

function renderCard(
  parent: HTMLElement,
  title: string,
  body: string,
  action?: CardAction,
  options: CardOptions = {},
): void {
  parent.replaceChildren()
  const card = document.createElement('div')
  card.className = options.motto ? 'card welcome' : 'card'

  const head = document.createElement('div')
  head.className = 'card-head'
  const heading = document.createElement('h1')
  if (options.accentTitle) heading.className = 'accent'
  heading.textContent = title
  head.append(heading)
  if (options.motto) {
    const motto = document.createElement('p')
    motto.className = 'card-motto'
    motto.textContent = options.motto
    head.append(motto)
  }

  const text = document.createElement('p')
  text.textContent = body
  card.append(head, text)

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

function getStream(facingMode: 'environment' | 'user'): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: FRAMERATE },
    },
    audio: false,
  })
}

async function startMirror(app: HTMLElement): Promise<void> {
  app.replaceChildren()
  renderMessage(app, 'Starting camera…')

  let stream: MediaStream
  try {
    stream = await getStream('environment')
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

  const firstTrack = stream.getVideoTracks()[0]
  if (!firstTrack) {
    renderCard(app, 'No camera', 'No camera track is available on this device.')
    return
  }

  localStorage.setItem(STARTED_KEY, '1')

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

  const cameraButton = new CameraButton(() => void switchCamera())
  app.append(cameraButton.element)

  const swipeHandle = document.createElement('button')
  swipeHandle.type = 'button'
  swipeHandle.className = 'swipe-handle'
  swipeHandle.setAttribute('aria-label', 'Open controls')
  swipeHandle.appendChild(chevronUpIcon())
  app.append(swipeHandle)

  let statusEl: HTMLParagraphElement | null = null
  const showStatus = (text: string): void => {
    if (!statusEl) {
      statusEl = document.createElement('p')
      statusEl.className = 'message'
      app.append(statusEl)
    }
    statusEl.textContent = text
  }
  const clearStatus = (): void => {
    statusEl?.remove()
    statusEl = null
  }
  showStatus('Starting camera…')

  const overlay = DEBUG ? new StatsOverlay() : null
  if (overlay) app.append(overlay.element)

  let currentSeconds = loadDelaySeconds(DEFAULT_DELAY_SECONDS)
  let baseDelayMs = currentSeconds * 1000

  let pipeline: DelayPipeline | null = null
  let source: FrameSource | null = null
  let activeTrack: MediaStreamTrack | null = null
  let activeCodec = ''
  let camera: 'environment' | 'user' = 'environment'
  let switching = false
  const cameraTargets: Partial<Record<'environment' | 'user', number>> = {}
  const walkthroughSeen = localStorage.getItem(WALKTHROUGH_KEY) === '1'
  let resolvingWalkthrough = false
  let walkthroughTriggered = false

  async function startSession(track: MediaStreamTrack): Promise<void> {
    const settings = track.getSettings()
    const width = settings.width ?? 1280
    const height = settings.height ?? 720
    activeCodec = await pickCodec(width, height, FRAMERATE, BITRATE)
    const initialTargetMs =
      cameraTargets[camera] ?? (camera === 'user' ? 0 : baseDelayMs)
    const session = new DelayPipeline({
      canvas,
      codec: activeCodec,
      width,
      height,
      framerate: FRAMERATE,
      bitrate: BITRATE,
      baseDelayMs,
      initialTargetMs,
      keyFrameInterval: KEY_FRAME_INTERVAL,
    })
    session.start()
    canvas.classList.toggle('mirrored', camera === 'user')
    pipeline = session
    activeTrack = track
    if (DEBUG) Reflect.set(window, 'hindsightPipeline', session)
    const activeSource = createFrameSource(track)
    source = activeSource
    const normalizer = createFrameNormalizer((frame) =>
      activeSource.rotationOf(frame),
    )
    activeSource.start((frame) => {
      const upright = normalizer.normalize(frame)
      session.encode(upright)
      upright.close()
    })
  }

  function stopSession(): void {
    if (pipeline)
      cameraTargets[camera] = pipeline.getDelayState().targetOffsetMs
    source?.stop()
    pipeline?.stop()
    activeTrack?.stop()
    pipeline = null
    source = null
    activeTrack = null
  }

  async function reacquire(
    facingMode: 'environment' | 'user',
    statusText: string,
  ): Promise<void> {
    if (switching) return
    switching = true
    stopSession()
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    indicator.element.hidden = true
    showStatus(statusText)
    let newStream: MediaStream
    try {
      newStream = await getStream(facingMode)
    } catch (error) {
      renderCard(app, 'Camera unavailable', (error as Error).message, {
        label: 'Reload',
        onClick: () => window.location.reload(),
      })
      switching = false
      return
    }
    const newTrack = newStream.getVideoTracks()[0]
    if (!newTrack) {
      renderCard(
        app,
        'No camera',
        'That camera is not available on this device.',
      )
      switching = false
      return
    }
    camera = facingMode
    try {
      await startSession(newTrack)
    } catch (error) {
      renderCard(app, 'Unsupported video', (error as Error).message)
      switching = false
      return
    }
    switching = false
  }

  async function switchCamera(): Promise<void> {
    await reacquire(
      camera === 'environment' ? 'user' : 'environment',
      'Switching camera…',
    )
  }

  let hiddenAt = 0
  function onVisibility(): void {
    if (document.visibilityState === 'hidden') {
      hiddenAt = performance.now()
      return
    }
    void requestWakeLock()
    const hiddenMs = hiddenAt ? performance.now() - hiddenAt : 0
    hiddenAt = 0
    if (switching) return
    if (activeTrack?.readyState === 'ended') {
      // The OS released the camera; reacquire from scratch.
      void reacquire(camera, 'Reconnecting…')
    } else if (pipeline && hiddenMs >= REBUFFER_AFTER_HIDDEN_MS) {
      // Frames stopped while backgrounded, leaving a stale gap that would show
      // as a frozen frame. Drop it and re-ramp so the countdown makes the
      // re-buffering visible.
      pipeline.rebuffer(camera === 'user' ? 0 : baseDelayMs)
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  if (!walkthroughSeen) cameraTargets.environment = 0

  try {
    await startSession(firstTrack)
  } catch (error) {
    renderCard(app, 'Unsupported video', (error as Error).message)
    return
  }

  const walkthrough = new Walkthrough(() => {
    if (!resolvingWalkthrough) return
    resolvingWalkthrough = false
    localStorage.setItem(WALKTHROUGH_KEY, '1')
    applyDelay(currentSeconds)
  })
  app.append(walkthrough.element)

  function applyDelay(seconds: number): void {
    currentSeconds = seconds
    baseDelayMs = seconds * 1000
    pipeline?.setBaseDelay(baseDelayMs)
    saveDelaySeconds(seconds)
    presetBar.updateActive(seconds)
  }

  let presets = loadPresets()
  const wheel = new DelayWheel((seconds) => applyDelay(seconds))
  const presetBar = new PresetBar(
    (seconds) => {
      applyDelay(seconds)
      wheel.setValue(seconds)
      sheet.close()
    },
    (label) => {
      presets = [...presets, { label, seconds: currentSeconds }]
      savePresets(presets)
      presetBar.setPresets(presets)
      presetBar.updateActive(currentSeconds)
    },
    (index) => {
      presets = presets.filter((_, i) => i !== index)
      savePresets(presets)
      presetBar.setPresets(presets)
      presetBar.updateActive(currentSeconds)
    },
  )
  presetBar.setPresets(presets)
  const sheet = new SettingsSheet(wheel, presetBar.element, () =>
    walkthrough.show(),
  )
  app.append(sheet.element)

  const helpButton = new HelpButton(() => {
    sheet.open('gestures')
  })
  app.append(helpButton.element)

  const guides = new Guides(app)

  const openControls = (): void => {
    sheet.open()
    wheel.setValue(currentSeconds)
    presetBar.updateActive(currentSeconds)
  }
  attachOpenGesture(canvas, openControls)
  swipeHandle.addEventListener('click', (event) => {
    event.stopPropagation()
    openControls()
  })

  attachTaps(
    canvas,
    () => {
      if (pipeline?.togglePause()) seekBar.pulse()
    },
    () => {
      if (pipeline?.toggleHome()) seekBar.pulse()
    },
  )

  attachScrub(canvas, {
    begin: () => pipeline?.beginScrub(),
    move: (deltaMs) => pipeline?.scrubBy(deltaMs),
    end: () => pipeline?.endScrub(),
  })

  void requestWakeLock()

  const drive = (): void => {
    const p = pipeline
    if (p) {
      const state = p.getDelayState()
      if (state.hasFrame) clearStatus()
      indicator.element.hidden = !state.hasFrame
      cameraButton.element.hidden = !state.hasFrame
      helpButton.element.hidden = !state.hasFrame
      swipeHandle.hidden = !state.hasFrame
      if (!walkthroughSeen && !walkthroughTriggered && state.hasFrame) {
        walkthroughTriggered = true
        resolvingWalkthrough = true
        walkthrough.show()
      }
      if (state.hasFrame)
        buildOverlay.sync(state.targetOffsetMs, state.availableMs)
      // Guides only make sense once the delayed replay is ready, so keep them
      // hidden (and undrawable) through the startup status and the countdown.
      guides.setActive(state.hasFrame && !buildOverlay.isActive())
      indicator.update(state.effectiveDelayMs, state.paused)
      seekBar.sync(
        state.scrubbing,
        state.effectiveDelayMs,
        state.baseDelayMs,
        state.availableMs,
      )
    }
    requestAnimationFrame(drive)
  }
  requestAnimationFrame(drive)

  setInterval(() => {
    const p = pipeline
    if (!p) return
    overlay?.update(p.getStats(), activeCodec)
  }, 250)
}

const TAP_MOVE_PX = 10
const TAP_MAX_MS = 300
const DOUBLE_TAP_MS = 280
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

function attachTaps(
  target: HTMLElement,
  onSingle: () => void,
  onDouble: () => void,
): void {
  let startX = 0
  let startY = 0
  let startT = 0
  let tracking = false
  let lastTapAt = 0
  let pending = 0
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
    if (Math.hypot(dx, dy) > TAP_MOVE_PX || dt > TAP_MAX_MS) return
    const tapAt = event.timeStamp
    if (tapAt - lastTapAt <= DOUBLE_TAP_MS) {
      window.clearTimeout(pending)
      lastTapAt = 0
      onDouble()
    } else {
      lastTapAt = tapAt
      pending = window.setTimeout(() => {
        lastTapAt = 0
        onSingle()
      }, DOUBLE_TAP_MS)
    }
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
    'Glance up and watch your last rep, hands-free. Your video stays on this device, in memory only — nothing is saved.',
    { label: 'Get started', onClick: () => void startMirror(app) },
    { accentTitle: true, motto: 'A mirror that runs a few seconds behind.' },
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

import './style.css'
import { DelayPipeline, pickCodec } from './delayPipeline'
import { createFrameSource } from './frameSource'
import { StatsOverlay } from './stats'

const BASE_DELAY_MS = 5000
const FRAMERATE = 30
const BITRATE = 3_000_000
const KEY_FRAME_INTERVAL = 60

function showMessage(parent: HTMLElement, text: string): void {
  const message = document.createElement('p')
  message.className = 'message'
  message.textContent = text
  parent.append(message)
}

async function requestWakeLock(): Promise<void> {
  if (!navigator.wakeLock) return
  await navigator.wakeLock.request('screen').catch(() => undefined)
}

async function main(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app')
  if (!app) throw new Error('Missing #app root element')

  if (!('VideoEncoder' in window)) {
    showMessage(app, 'WebCodecs is not supported on this browser.')
    return
  }

  const canvas = document.createElement('canvas')
  canvas.className = 'viewport'
  app.append(canvas)

  const overlay = new StatsOverlay()
  app.append(overlay.element)

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
    showMessage(app, `Camera unavailable: ${(error as Error).message}`)
    return
  }

  const track = stream.getVideoTracks()[0]
  if (!track) {
    showMessage(app, 'No camera track available.')
    return
  }

  const settings = track.getSettings()
  const width = settings.width ?? 1280
  const height = settings.height ?? 720
  const codec = await pickCodec(width, height, FRAMERATE, BITRATE)

  const pipeline = new DelayPipeline({
    canvas,
    codec,
    width,
    height,
    framerate: FRAMERATE,
    bitrate: BITRATE,
    baseDelayMs: BASE_DELAY_MS,
    keyFrameInterval: KEY_FRAME_INTERVAL,
  })
  pipeline.start()

  const source = createFrameSource(track)
  source.start((frame) => {
    pipeline.encode(frame)
    frame.close()
  })

  void requestWakeLock()
  setInterval(() => overlay.update(pipeline.getStats(), codec), 500)
}

void main().catch((error: unknown) => {
  const app = document.querySelector<HTMLDivElement>('#app')
  if (app) showMessage(app, `Error: ${(error as Error).message}`)
})

import { TimedRingBuffer } from './timedRingBuffer'

export interface PipelineStats {
  capturedFps: number
  displayedFps: number
  effectiveDelayMs: number
  targetDelayMs: number
  availableMs: number
  bufferChunks: number
  bufferBytes: number
  latencyMs: number
  configWidth: number
  configHeight: number
  sourceWidth: number
  sourceHeight: number
}

export interface DelayPipelineOptions {
  canvas: HTMLCanvasElement
  codec: string
  width: number
  height: number
  framerate: number
  bitrate: number
  baseDelayMs: number
  keyFrameInterval: number
}

interface BufferedFrame {
  chunk: EncodedVideoChunk
  captureWall: number
  keyframe: boolean
}

const HEADROOM_MS = 60_000
const MAX_WINDOW_MS = 300_000
const MAX_BUFFER_BYTES = 128 * 1024 * 1024
const FORWARD_GAP_MS = 1000

const CANDIDATE_CODECS = ['avc1.42001f', 'avc1.42e01e', 'vp8', 'vp09.00.10.08']

export async function pickCodec(
  width: number,
  height: number,
  framerate: number,
  bitrate: number,
): Promise<string> {
  for (const codec of CANDIDATE_CODECS) {
    const support = await VideoEncoder.isConfigSupported({
      codec,
      width,
      height,
      framerate,
      bitrate,
    })
    if (support.supported) return codec
  }
  throw new Error('No supported WebCodecs video codec found')
}

export class DelayPipeline {
  private readonly ctx: CanvasRenderingContext2D
  private readonly encoder: VideoEncoder
  private readonly decoder: VideoDecoder
  private readonly buffer: TimedRingBuffer<BufferedFrame>
  private readonly captureWall = new Map<number, number>()
  private readonly decodeWall = new Map<number, number>()
  private decoderConfig: VideoDecoderConfig | null = null
  private encoderConfigured = false
  private sourceWidth = 0
  private sourceHeight = 0
  private sizeSet = false
  private framesSinceKey: number
  private rafId = 0
  private targetDelayMs: number
  private retentionWindowMs: number
  private committedDelayMs = 0
  private effectiveDelayMs = 0
  private cursorTime = 0

  private lastTargetWall: number | null = null
  private seekTargetTs: number | null = null

  private capturedCount = 0
  private displayedCount = 0
  private latencyMs = 0
  private sampleTime = performance.now()
  private sampleCaptured = 0
  private sampleDisplayed = 0
  private readonly opts: DelayPipelineOptions

  constructor(opts: DelayPipelineOptions) {
    this.opts = opts
    this.targetDelayMs = opts.baseDelayMs
    const ctx = opts.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    this.ctx = ctx
    this.framesSinceKey = opts.keyFrameInterval
    this.retentionWindowMs = Math.min(
      MAX_WINDOW_MS,
      opts.baseDelayMs + HEADROOM_MS,
    )
    this.buffer = new TimedRingBuffer<BufferedFrame>(
      this.retentionWindowMs,
      MAX_BUFFER_BYTES,
    )

    this.decoder = new VideoDecoder({
      output: (frame) => this.onDecoded(frame),
      error: (error) => console.error('VideoDecoder', error),
    })

    this.encoder = new VideoEncoder({
      output: (chunk, metadata) => this.onEncoded(chunk, metadata),
      error: (error) => console.error('VideoEncoder', error),
    })
  }

  private configureEncoder(frame: VideoFrame): void {
    this.sourceWidth = frame.displayWidth
    this.sourceHeight = frame.displayHeight
    this.encoder.configure({
      codec: this.opts.codec,
      width: frame.displayWidth,
      height: frame.displayHeight,
      framerate: this.opts.framerate,
      bitrate: this.opts.bitrate,
      latencyMode: 'realtime',
    })
    this.encoderConfigured = true
  }

  start(): void {
    this.rafId = requestAnimationFrame(this.feed)
  }

  stop(): void {
    cancelAnimationFrame(this.rafId)
    this.encoder.close()
    this.decoder.close()
  }

  setBaseDelay(ms: number): void {
    this.targetDelayMs = ms
    this.retentionWindowMs = Math.min(
      MAX_WINDOW_MS,
      Math.max(this.retentionWindowMs, ms + HEADROOM_MS),
    )
    this.buffer.setMaxWindow(this.retentionWindowMs)
  }

  encode(frame: VideoFrame): void {
    if (!this.encoderConfigured) this.configureEncoder(frame)
    this.captureWall.set(frame.timestamp, performance.now())
    this.capturedCount += 1
    const keyFrame = this.framesSinceKey >= this.opts.keyFrameInterval
    this.framesSinceKey = keyFrame ? 1 : this.framesSinceKey + 1
    this.encoder.encode(frame, { keyFrame })
  }

  getDelayState(): {
    effectiveDelayMs: number
    targetDelayMs: number
    availableMs: number
  } {
    const oldest = this.buffer.oldestTime
    const availableMs = oldest === undefined ? 0 : performance.now() - oldest
    return {
      effectiveDelayMs: this.effectiveDelayMs,
      targetDelayMs: this.targetDelayMs,
      availableMs,
    }
  }

  getStats(): PipelineStats {
    const now = performance.now()
    const dt = (now - this.sampleTime) / 1000
    const capturedFps =
      dt > 0 ? (this.capturedCount - this.sampleCaptured) / dt : 0
    const displayedFps =
      dt > 0 ? (this.displayedCount - this.sampleDisplayed) / dt : 0
    this.sampleTime = now
    this.sampleCaptured = this.capturedCount
    this.sampleDisplayed = this.displayedCount

    const oldest = this.buffer.oldestTime
    const available = oldest === undefined ? 0 : now - oldest
    return {
      capturedFps,
      displayedFps,
      effectiveDelayMs: this.effectiveDelayMs,
      targetDelayMs: this.targetDelayMs,
      availableMs: available,
      bufferChunks: this.buffer.size,
      bufferBytes: this.buffer.bytes,
      latencyMs: this.latencyMs,
      configWidth: this.opts.width,
      configHeight: this.opts.height,
      sourceWidth: this.sourceWidth,
      sourceHeight: this.sourceHeight,
    }
  }

  private onEncoded(
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ): void {
    if (!this.decoderConfig && metadata?.decoderConfig) {
      this.decoderConfig = metadata.decoderConfig
      this.decoder.configure(this.decoderConfig)
    }
    const captureWall =
      this.captureWall.get(chunk.timestamp) ?? performance.now()
    this.captureWall.delete(chunk.timestamp)
    this.buffer.push(captureWall, chunk.byteLength, {
      chunk,
      captureWall,
      keyframe: chunk.type === 'key',
    })
  }

  private onDecoded(frame: VideoFrame): void {
    if (this.seekTargetTs !== null) {
      if (frame.timestamp < this.seekTargetTs) {
        frame.close()
        return
      }
      this.seekTargetTs = null
    }
    const wall = this.decodeWall.get(frame.timestamp)
    if (wall !== undefined) {
      this.latencyMs = performance.now() - wall
      this.decodeWall.delete(frame.timestamp)
    }
    this.displayedCount += 1
    this.draw(frame)
    frame.close()
  }

  private draw(frame: VideoFrame): void {
    const canvas = this.opts.canvas
    if (!this.sizeSet) {
      canvas.width = frame.displayWidth
      canvas.height = frame.displayHeight
      this.sizeSet = true
    }
    this.ctx.drawImage(frame, 0, 0, canvas.width, canvas.height)
  }

  private readonly feed = (): void => {
    this.advance()
    this.rafId = requestAnimationFrame(this.feed)
  }

  private advance(): void {
    if (!this.decoderConfig) return
    const oldest = this.buffer.oldestTime
    if (oldest === undefined) return

    const now = performance.now()
    this.cursorTime = this.nextCursorTime(now, oldest)
    this.renderCursor(this.cursorTime)
  }

  private nextCursorTime(now: number, oldest: number): number {
    const available = now - oldest
    if (available >= this.targetDelayMs)
      this.committedDelayMs = this.targetDelayMs
    const effectiveDelay = Math.min(this.committedDelayMs, available)
    this.effectiveDelayMs = effectiveDelay
    return now - effectiveDelay
  }

  private renderCursor(cursorTime: number): void {
    if (!this.decoderConfig) return
    const target = this.buffer.chunkAt(cursorTime)
    if (!target) return
    if (target.captureWall === this.lastTargetWall) return

    const last = this.lastTargetWall
    if (
      last !== null &&
      target.captureWall > last &&
      target.captureWall - last <= FORWARD_GAP_MS
    ) {
      const run = this.buffer.entriesBetween(last + 0.001, target.captureWall)
      this.decodeRun(run)
    } else {
      const keyframe = this.buffer.findLatest(
        target.captureWall,
        (value) => value.keyframe,
      )
      if (!keyframe) return
      this.decoder.reset()
      this.decoder.configure(this.decoderConfig)
      this.seekTargetTs = target.chunk.timestamp
      const run = this.buffer.entriesBetween(
        keyframe.captureWall,
        target.captureWall,
      )
      this.decodeRun(run)
    }

    this.decodeWall.set(target.chunk.timestamp, target.captureWall)
    this.lastTargetWall = target.captureWall
  }

  private decodeRun(run: BufferedFrame[]): void {
    for (const frame of run) {
      try {
        this.decoder.decode(frame.chunk)
      } catch (error) {
        console.error('decode', error)
      }
    }
  }
}

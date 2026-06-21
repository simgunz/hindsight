export interface PipelineStats {
  capturedFps: number
  displayedFps: number
  effectiveDelayMs: number
  bufferChunks: number
  bufferBytes: number
  latencyMs: number
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

interface BufferedChunk {
  chunk: EncodedVideoChunk
  captureWall: number
}

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
  private readonly buffer: BufferedChunk[] = []
  private readonly captureWall = new Map<number, number>()
  private readonly decodeWall = new Map<number, number>()
  private decoderReady = false
  private sizeSet = false
  private framesSinceKey: number
  private readonly startTime = performance.now()
  private rafId = 0

  private capturedCount = 0
  private displayedCount = 0
  private latencyMs = 0
  private sampleTime = performance.now()
  private sampleCaptured = 0
  private sampleDisplayed = 0
  private readonly opts: DelayPipelineOptions

  constructor(opts: DelayPipelineOptions) {
    this.opts = opts
    const ctx = opts.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    this.ctx = ctx
    this.framesSinceKey = opts.keyFrameInterval

    this.decoder = new VideoDecoder({
      output: (frame) => this.onDecoded(frame),
      error: (error) => console.error('VideoDecoder', error),
    })

    this.encoder = new VideoEncoder({
      output: (chunk, metadata) => this.onEncoded(chunk, metadata),
      error: (error) => console.error('VideoEncoder', error),
    })
    this.encoder.configure({
      codec: opts.codec,
      width: opts.width,
      height: opts.height,
      framerate: opts.framerate,
      bitrate: opts.bitrate,
      latencyMode: 'realtime',
    })
  }

  start(): void {
    this.rafId = requestAnimationFrame(this.feed)
  }

  stop(): void {
    cancelAnimationFrame(this.rafId)
    this.encoder.close()
    this.decoder.close()
  }

  encode(frame: VideoFrame): void {
    this.captureWall.set(frame.timestamp, performance.now())
    this.capturedCount += 1
    const keyFrame = this.framesSinceKey >= this.opts.keyFrameInterval
    this.framesSinceKey = keyFrame ? 1 : this.framesSinceKey + 1
    this.encoder.encode(frame, { keyFrame })
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
    let bytes = 0
    for (const item of this.buffer) bytes += item.chunk.byteLength
    return {
      capturedFps,
      displayedFps,
      effectiveDelayMs: Math.min(this.opts.baseDelayMs, now - this.startTime),
      bufferChunks: this.buffer.length,
      bufferBytes: bytes,
      latencyMs: this.latencyMs,
    }
  }

  private onEncoded(
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ): void {
    if (!this.decoderReady && metadata?.decoderConfig) {
      this.decoder.configure(metadata.decoderConfig)
      this.decoderReady = true
    }
    const captureWall =
      this.captureWall.get(chunk.timestamp) ?? performance.now()
    this.captureWall.delete(chunk.timestamp)
    this.buffer.push({ chunk, captureWall })
  }

  private onDecoded(frame: VideoFrame): void {
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
    if (this.decoderReady) {
      const now = performance.now()
      const effDelay = Math.min(this.opts.baseDelayMs, now - this.startTime)
      let head = this.buffer[0]
      while (head && now - head.captureWall >= effDelay) {
        this.buffer.shift()
        this.decodeWall.set(head.chunk.timestamp, head.captureWall)
        try {
          this.decoder.decode(head.chunk)
        } catch (error) {
          console.error('decode', error)
        }
        head = this.buffer[0]
      }
    }
    this.rafId = requestAnimationFrame(this.feed)
  }
}

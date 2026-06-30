import { screenAngleToRotation } from './orientation'

export interface FrameSource {
  start(onFrame: (frame: VideoFrame) => void): void
  stop(): void
  rotationOf(frame: VideoFrame): number
}

export function createFrameSource(track: MediaStreamTrack): FrameSource {
  if ('MediaStreamTrackProcessor' in window) {
    return new ProcessorFrameSource(track)
  }
  return new VideoElementFrameSource(track)
}

class ProcessorFrameSource implements FrameSource {
  private reader: ReadableStreamDefaultReader<VideoFrame> | null = null
  private stopped = false
  private readonly track: MediaStreamTrack

  constructor(track: MediaStreamTrack) {
    this.track = track
  }

  start(onFrame: (frame: VideoFrame) => void): void {
    const processor = new MediaStreamTrackProcessor({ track: this.track })
    this.reader = processor.readable.getReader()
    const pump = async (): Promise<void> => {
      const reader = this.reader
      if (!reader) return
      while (!this.stopped) {
        const { value, done } = await reader.read()
        if (done) break
        if (value) onFrame(value)
      }
    }
    void pump()
  }

  stop(): void {
    this.stopped = true
    void this.reader?.cancel()
    this.reader = null
  }

  rotationOf(frame: VideoFrame): number {
    return frame.rotation ?? 0
  }
}

class VideoElementFrameSource implements FrameSource {
  private video: HTMLVideoElement | null = null
  private stopped = false
  private readonly track: MediaStreamTrack

  constructor(track: MediaStreamTrack) {
    this.track = track
  }

  start(onFrame: (frame: VideoFrame) => void): void {
    const video = document.createElement('video')
    video.srcObject = new MediaStream([this.track])
    video.muted = true
    video.playsInline = true
    this.video = video
    const tick = (_now: number, metadata: VideoFrameCallbackMetadata): void => {
      if (this.stopped) return
      const frame = new VideoFrame(video, {
        timestamp: metadata.mediaTime * 1_000_000,
      })
      onFrame(frame)
      video.requestVideoFrameCallback(tick)
    }
    void video.play().then(() => video.requestVideoFrameCallback(tick))
  }

  stop(): void {
    this.stopped = true
    if (this.video) {
      this.video.srcObject = null
      this.video = null
    }
  }

  rotationOf(_frame: VideoFrame): number {
    return screenAngleToRotation(screen.orientation?.angle ?? 0)
  }
}

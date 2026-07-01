import { uprightDimensions } from './orientation'

export interface FrameNormalizer {
  normalize(frame: VideoFrame): VideoFrame
}

export function createFrameNormalizer(
  rotationOf: (frame: VideoFrame) => number,
): FrameNormalizer {
  return new CanvasFrameNormalizer(rotationOf)
}

class CanvasFrameNormalizer implements FrameNormalizer {
  private canvas: OffscreenCanvas | null = null
  private ctx: OffscreenCanvasRenderingContext2D | null = null
  private readonly rotationOf: (frame: VideoFrame) => number

  constructor(rotationOf: (frame: VideoFrame) => number) {
    this.rotationOf = rotationOf
  }

  normalize(frame: VideoFrame): VideoFrame {
    const rotation = ((this.rotationOf(frame) % 360) + 360) % 360
    if (rotation === 0) return frame

    const sourceWidth = frame.displayWidth
    const sourceHeight = frame.displayHeight
    const { width, height } = uprightDimensions(
      sourceWidth,
      sourceHeight,
      rotation,
    )
    const ctx = this.context(width, height)
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(frame, -sourceWidth / 2, -sourceHeight / 2)
    ctx.restore()

    const upright = new VideoFrame(this.canvas as OffscreenCanvas, {
      timestamp: frame.timestamp,
    })
    frame.close()
    return upright
  }

  private context(
    width: number,
    height: number,
  ): OffscreenCanvasRenderingContext2D {
    if (!this.canvas) {
      this.canvas = new OffscreenCanvas(width, height)
      this.ctx = this.canvas.getContext('2d')
    } else if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
    }
    if (!this.ctx) throw new Error('OffscreenCanvas 2D context unavailable')
    return this.ctx
  }
}

import type { PipelineStats } from './delayPipeline'

export class StatsOverlay {
  readonly element: HTMLDivElement

  constructor() {
    const element = document.createElement('div')
    element.className = 'stats'
    this.element = element
  }

  update(stats: PipelineStats, codec: string): void {
    const overheadMs = Math.max(0, stats.latencyMs - stats.effectiveDelayMs)
    const lines = [
      `codec ${codec}`,
      `capture ${stats.capturedFps.toFixed(1)} fps`,
      `display ${stats.displayedFps.toFixed(1)} fps`,
      `delay ${(stats.effectiveDelayMs / 1000).toFixed(1)} s`,
      `avail ${(stats.availableMs / 1000).toFixed(1)} s`,
      `capture age ${Number.isFinite(stats.captureAgeMs) ? `${stats.captureAgeMs.toFixed(0)} ms` : '—'}`,
      `overhead ${overheadMs.toFixed(0)} ms`,
      `buffer ${stats.bufferChunks} ch / ${(stats.bufferBytes / 1_000_000).toFixed(1)} MB`,
      `dims req ${stats.configWidth}x${stats.configHeight} src ${stats.sourceWidth}x${stats.sourceHeight}`,
    ]
    this.element.textContent = lines.join('\n')
  }
}

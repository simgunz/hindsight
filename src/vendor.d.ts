interface MediaStreamTrackProcessorInit {
  track: MediaStreamTrack
  maxBufferSize?: number
}

declare class MediaStreamTrackProcessor {
  constructor(init: MediaStreamTrackProcessorInit)
  readonly readable: ReadableStream<VideoFrame>
}

interface VideoFrame {
  readonly rotation?: number
  readonly flip?: boolean
}

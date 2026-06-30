export interface Dimensions {
  width: number
  height: number
}

export function uprightDimensions(
  width: number,
  height: number,
  rotation: number,
): Dimensions {
  return rotation % 180 === 0
    ? { width, height }
    : { width: height, height: width }
}

const SENSOR_LANDSCAPE_OFFSET = 90

export function screenAngleToRotation(angle: number): number {
  return (SENSOR_LANDSCAPE_OFFSET - angle + 360) % 360
}

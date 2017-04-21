import { toPoints } from 'svg-points'

/**
 * Shape data as specified by the
 * {@link https://github.com/colinmeinke/points Points spec}.
 *
 * @typedef {Object[]} Points
 */

/**
 * The data required to render a shape.
 *
 * @typedef {Object} FrameShape
 *
 * @property {Points} points
 * @property {Object} styles
 * @property {FrameShape[]} childFrameShapes
 */

/**
 * An array of FrameShapes
 *
 * @typedef {FrameShape[]} Frame
 */

/**
 * A number between 0 and 1 (inclusive).
 *
 * @typedef {number} Position
 */

/**
 * Creates a FrameShape from a Plain Shape Object.
 *
 * @param {PlainShapeObject} plainShapeObject
 *
 * @returns {FrameShape}
 *
 * @example
 * frameShape(circle)
 */
const frameShape = ({ shapes: childPlainShapeObjects, ...plainShapeObject }) => {
  const k = {
    styles: {}
  }

  if (plainShapeObject.type !== 'g') {
    k.points = toPoints(plainShapeObject)
  } else if (childPlainShapeObjects) {
    k.childFrameShapes = childPlainShapeObjects.map(childPlainShapeObject => (
      frameShape(childPlainShapeObject)
    ))
  }

  return k
}

/**
 * The number of iterations completed.
 *
 * @param {Object} opts
 * @param {number} opts.at
 * @param {number} opts.delay
 * @param {number} opts.duration
 * @param {number} opts.iterations
 * @param {number} [opts.started]
 *
 * @returns {number}
 *
 * @example
 * iterations(opts)
 */
const iterationsComplete = ({ at, delay, duration, iterations, started }) => {
  const start = started + delay

  if (typeof started === 'undefined' || at <= start) {
    return 0
  }

  const ms = at - start
  const maxDuration = duration * iterations

  if (ms >= maxDuration) {
    return iterations
  }

  return ms / duration
}

/**
 * A position at a given time
 *
 * @param {PlaybackOptions} playbackOptions
 * @param {number} at
 *
 * @returns {Position}
 *
 * @example
 * position(playbackOptions, Date.now())
 */
const position = ({
  alternate,
  delay,
  duration,
  initialIterations,
  iterations,
  reverse,
  started
}, at) => {
  const totalIterations = initialIterations +
    iterationsComplete({ at, delay, duration, iterations, started })

  const i = totalIterations % 1

  return alternate && totalIterations % 2 > 1
    ? reverse ? i : 1 - i
    : reverse ? 1 - i : i
}

/**
 * Calculates the the current Frame of a Timeline
 *
 * @param {Timeline} timeline
 * @param {number} [at]
 *
 * @returns {Frame}
 *
 * @example
 * frame(timeline)
 */
const frame = (timeline, at) => {
  if (typeof timeline !== 'object' || !timeline.timelineShapes || !timeline.playbackOptions) {
    throw new TypeError(`The frame function's first argument must be a Timeline`)
  }

  if (typeof at !== 'undefined' && typeof at !== 'number') {
    throw new TypeError(`The frame function's second argument must be of type number`)
  }

  const timelinePosition = position(
    timeline.playbackOptions,
    typeof at !== 'undefined' ? at : Date.now()
  )

  return []
}

export { frameShape, position }
export default frame

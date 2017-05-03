import { output } from './middleware'
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
 * @property {Object} attributes
 * @property {FrameShape[]} childFrameShapes
 */

/**
 * A FrameShape array.
 *
 * @typedef {FrameShape[]} Frame
 */

/**
 * A number between 0 and 1 (inclusive).
 *
 * @typedef {number} Position
 */

/**
 * The the current Frame of a Timeline.
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

  return timeline.timelineShapes.map(({ shape, timelinePosition: { start, end } }) => {
    if (timelinePosition <= start) {
      return output(shape.keyframes[ 0 ].frameShape, timeline.middleware)
    } else if (timelinePosition >= end) {
      return output(shape.keyframes[ shape.keyframes.length - 1 ].frameShape, timeline.middleware)
    }

    return frameShapeFromShape({
      shape,
      position: (timelinePosition - start) / (end - start),
      middleware: timeline.middleware
    })
  })
}

/**
 * Creates a FrameShape from a PlainShapeObject.
 *
 * @param {PlainShapeObject} plainShapeObject
 *
 * @returns {FrameShape}
 *
 * @example
 * frameShapeFromPlainShapeObject(circle)
 */
const frameShapeFromPlainShapeObject = ({ shapes: childPlainShapeObjects, ...plainShapeObject }) => {
  const {
    type,
    height,
    width,
    x,
    y,
    cx,
    cy,
    r,
    rx,
    ry,
    x1,
    x2,
    y1,
    y2,
    d,
    points,
    shapes,
    ...attributes
  } = plainShapeObject

  if (plainShapeObject.type === 'g' && childPlainShapeObjects) {
    return {
      attributes,
      childFrameShapes: childPlainShapeObjects.map(childPlainShapeObject => (
        frameShapeFromPlainShapeObject(childPlainShapeObject)
      ))
    }
  }

  return {
    attributes,
    points: toPoints(plainShapeObject)
  }
}

/**
 * Creates a FrameShape from a Shape given the position.
 *
 * @param {Shape} shape
 * @param {Position} position
 *
 * @returns {FrameShape}
 *
 * @example
 * frameShapeFromShape({ shape, position: 0.75 })
 */
const frameShapeFromShape = ({ shape, position, middleware = [] }) => {
  const fromIndex = shape.keyframes.reduce((currentFromIndex, { position: keyframePosition }, i) => (
    position > keyframePosition ? i : currentFromIndex
  ), 0)

  const toIndex = fromIndex + 1

  const from = shape.keyframes[ fromIndex ]
  const to = shape.keyframes[ toIndex ]

  const frameShape = tween(
    from.frameShape,
    to.frameShape,
    to.tween.easing,
    (position - from.position) / (to.position - from.position)
  )

  return output(frameShape, middleware)
}

/**
 * Is the direction same as initial direction?
 *
 * @param {boolean} alternate
 * @param {number} totalIterations
 *
 * @return {boolean}
 *
 * @example
 * initialDirection(true, 3.25)
 */
const initialDirection = (alternate, totalIterations) => (
  alternate &&
  (totalIterations % 2 > 1 ||
    (totalIterations % 2 === 0 && totalIterations >= 2)
  )
)

/**
 * The number of iterations a Timeline has completed.
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
 * A Position at a given time.
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

  const relativeIteration = totalIterations >= 1 && totalIterations % 1 === 0
    ? 1
    : totalIterations % 1

  return initialDirection(alternate, totalIterations)
    ? reverse ? relativeIteration : 1 - relativeIteration
    : reverse ? 1 - relativeIteration : relativeIteration
}

/**
 * Tween between any two values.
 *
 * @param {*} from
 * @param {*} to - An identicle structure to the from param
 * @param {function} easing - The easing function to apply
 * @param {Position} position
 *
 * @returns {*}
 *
 * @example
 * tween(0, 100, easeOut, 0.75)
 */
const tween = (from, to, easing, position) => {
  const errorMsg = `The tween function's from and to arguments must be of an identicle structure`

  if (Array.isArray(from)) {
    if (!Array.isArray(to)) {
      throw new TypeError(errorMsg)
    }

    return from.map((f, i) => (tween(f, to[ i ], easing, position)))
  } else if (from !== null && typeof from === 'object') {
    if (to !== null && typeof to !== 'object') {
      throw new TypeError(errorMsg)
    }

    const obj = {}

    Object.keys(from).map(k => {
      obj[ k ] = tween(from[ k ], to[ k ], easing, position)
    })

    return obj
  } else if (typeof from === 'number') {
    if (typeof to !== 'number') {
      throw new TypeError(errorMsg)
    }

    if (from === to) {
      return from
    }

    return easing(position, from, to, 1)
  }

  return from
}

export { frameShapeFromPlainShapeObject, position, tween }
export default frame

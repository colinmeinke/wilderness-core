/* globals __DEV__ */

import clone from './clone'
import config from './config'
import { input } from './middleware'

/**
 * The position of an object on a Timeline
 * where 0 is Timeline start and 1 is Timeline end.
 *
 * @typedef {Object} TimelinePosition
 *
 * @property {Position} start
 * @property {Position} end
 */

/**
 * A Shape positioned on a Timeline.
 *
 * @typedef {Object} TimelineShape
 *
 * @property {Shape} shape
 * @property {TimelinePosition} timelinePosition
 */

/**
 * The position of an object on a Timeline in milliseconds.
 *
 * @typedef {Object} MsTimelinePosition
 *
 * @property {number} start.
 * @property {number} end.
 */

/**
 * A Shape positioned on a Timeline (position set in milliseconds).
 *
 * @typedef {Object} MsTimelineShape
 *
 * @property {Shape} shape
 * @property {MsTimelinePosition} timelinePosition
 */

/**
 * A TimelineShape array and their total duration.
 *
 * @typedef {Object} TimelineShapesAndDuration
 *
 * @property {TimelineShape[]} timelineShapes
 * @property {number} duration
 */

/**
 * The options required to calculate the current playback Position.
 *
 * @typedef {Object} PlaybackOptions
 *
 * @property {boolean} alternate - Should the next iteration reverse current direction?
 * @property {number} duration - Milliseconds that each iteration lasts.
 * @property {number} initialIterations - The starting number of iterations.
 * @property {number} iterations - The number of playback interations (additional to initialIterations).
 * @property {boolean} reverse - Should the first iteration start in a reverse direction?
 * @property {number} [started] - The UNIX timestamp of playback start.
 */

/**
 * PlaybackOptions and tween middleware.
 *
 * @typedef {Object} TimelineOptions
 *
 * @extends PlaybackOptions
 * @property {Middleware[]} middleware
 */

/**
 * A Shape and timeline related options.
 *
 * @typedef {Object} ShapeWithOptions
 *
 * @property {Shape} shape
 * @property {(string|number)} name - A unique reference.
 * @property {(string|number)} follow - The name of the Shape to queue after.
 * @property {number} offset - Millisecond offset from end of the follow Shape to start of this Shape.
 */

/**
 * An object containing Middlware, PlaybackOptions and ShapesWithOptions.
 *
 * @typedef {Object} SortedTimelineProps
 *
 * @property {Middleware[]} middleware
 * @property {PlaybackOptions} playbackOptions
 * @property {ShapeWithOptions[]} shapesWithOptions
 */

/**
 * A sequence of Shapes.
 *
 * @typedef {Object} Timeline
 *
 * @property {Middleware[]} middleware
 * @property {PlaybackOptions} playbackOptions
 * @property {Object} state - Holds the last known state of the timeline.
 * @property {TimelineShape[]} timelineShapes
 */

/**
 * The options for the currentReverse function.
 *
 * @typedef {Object} CurrentReverseOptions
 *
 * @extends PlaybackOptions
 * @property {Object[]} complete - The number of iterations complete.
 */

/**
 * Runs each Middleware input function on every Keyframe's FrameShape.
 *
 * @param {Shape} shape
 * @param {Middleware[]} middleware
 *
 * @example
 * apply(shape, middleware)
 */
const apply = ({ keyframes }, middleware) => {
  keyframes.map(keyframe => {
    keyframe.frameShape = input(keyframe.frameShape, middleware)
  })
}

/**
 * Is playback currently in reverse?
 *
 * @param {CurrentReverseOptions} opts
 *
 * @example
 * currentReverse({ ...playbackOptions, complete })
 */
const currentReverse = ({
  alternate,
  complete,
  initialIterations,
  iterations,
  reverse
}) => {
  if (complete === 0) {
    return reverse
  }

  const initialReverse = sameDirection(alternate, initialIterations)
    ? reverse
    : !reverse

  return sameDirection(alternate, initialIterations + complete)
    ? initialReverse
    : !initialReverse
}

/**
 * The number of iterations a Timeline has completed.
 *
 * @param {Object} opts
 * @param {number} opts.at
 * @param {number} opts.duration
 * @param {number} opts.iterations
 * @param {number} [opts.started]
 *
 * @returns {number}
 *
 * @example
 * iterations(opts)
 */
const iterationsComplete = ({ at, duration, iterations, started }) => {
  if (typeof started === 'undefined' || at <= started) {
    return 0
  }

  const ms = at - started
  const maxDuration = duration * iterations

  if (ms >= maxDuration) {
    return iterations
  }

  return ms / duration
}

/**
 * Stops playback of a Timeline.
 *
 * @param {Timeline} timeline
 * @param {PlaybackOptions} playbackOptions
 * @param {number} [at]
 *
 * @example
 * pause(timeline)
 */
const pause = (timeline, playbackOptions = {}, at) => {
  timeline.playbackOptions = updatePlaybackOptions(timeline, playbackOptions, at)
  delete timeline.playbackOptions.started
}

/**
 * Starts playback of a Timeline.
 *
 * @param {Timeline} timeline
 * @param {PlaybackOptions} playbackOptions
 * @param {number} [at]
 *
 * @example
 * play(timeline, { initialIterations: 0 })
 */
const play = (timeline, playbackOptions = {}, at) => {
  timeline.playbackOptions = updatePlaybackOptions(timeline, playbackOptions, at)
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
const position = (playbackOptions, at) => {
  const complete = iterationsComplete({ ...playbackOptions, at })
  const total = playbackOptions.initialIterations + complete
  const i = total >= 1 && total % 1 === 0 ? 1 : total % 1
  return currentReverse({ ...playbackOptions, complete }) ? 1 - i : i
}

/**
 * Is the direction same as initial direction?
 *
 * @param {boolean} alternate - Is iteration direction alternating?
 * @param {number} iterations - The number of iterations complete.
 *
 * @return {boolean}
 *
 * @example
 * sameDirection(true, 3.25)
 */
const sameDirection = (alternate, iterations) => {
  const x = iterations % 2
  return !alternate || iterations === 0 || (x <= 1 && x % 2 > 0)
}

/**
 * Calculate the start position of a Shape on the Timeline.
 *
 * @param {Object} props
 * @param {(string|number)} [props.follow]
 * @param {MsTimelineShape[]} props.msTimelineShapes
 * @param {number} props.offset
 * @param {number} props.timelineEnd - The current end of the timeline.
 *
 * @returns {number}
 *
 * @example
 * shapeStart({ 'foo', msTimelineShapes, 200, 2000 })
 */
const shapeStart = ({ follow, msTimelineShapes, offset, timelineEnd }) => {
  if (typeof follow !== 'undefined') {
    for (let i = 0; i < msTimelineShapes.length; i++) {
      const s = msTimelineShapes[ i ]

      if (follow === s.shape.name) {
        return s.timelinePosition.end + offset
      }
    }

    for (let i = 0; i < msTimelineShapes.length; i++) {
      const s = msTimelineShapes[ i ]

      for (let j = 0; j < s.shape.keyframes.length; j++) {
        const keyframe = s.shape.keyframes[ j ]

        if (follow === keyframe.name) {
          if (follow === keyframe.name) {
            return s.timelinePosition.start +
              s.shape.duration * keyframe.position + offset
          }
        }
      }
    }

    if (__DEV__) {
      throw new Error(`No Shape or Keyframe matching name '${follow}'`)
    }
  }

  return timelineEnd + offset
}

/**
 * Create a ShapeWithOptions from an array.
 *
 * @param {Object[]} arr
 * @param {Shape} arr.0
 * @param {Object} arr.1
 *
 * @returns {ShapeWithOptions}
 *
 * @example
 * shapeWithOptionsFromArray(arr, i)
 */
const shapeWithOptionsFromArray = ([ shape, options ], i) => {
  if (__DEV__ && (typeof shape !== 'object' || !shape.keyframes)) {
    throw new TypeError(`When an array is passed to the timeline function the first item must be a Shape`)
  }

  if (__DEV__ && (typeof options !== 'object')) {
    throw new TypeError(`When an array is passed to the timeline function the second item must be an object`)
  }

  const { name = i, queue = config.defaults.timeline.queue } = options

  if (__DEV__ && (typeof name !== 'string' && typeof name !== 'number')) {
    throw new TypeError(`The name prop must be of type string or number`)
  }

  if (typeof queue !== 'undefined') {
    if (Array.isArray(queue)) {
      if (__DEV__ && (typeof queue[ 0 ] !== 'string' && typeof queue[ 0 ] !== 'number')) {
        throw new TypeError(`The queue prop first array item must be of type string or number`)
      }

      if (__DEV__ && (typeof queue[ 1 ] !== 'number')) {
        throw new TypeError(`The queue prop second array item must be of type number`)
      }

      return { follow: queue[ 0 ], name, offset: queue[ 1 ], shape }
    } else if (typeof queue === 'number') {
      return { name, offset: queue, shape }
    } else if (typeof queue === 'string') {
      return { follow: queue, name, offset: 0, shape }
    }

    if (__DEV__) {
      throw new TypeError(`The queue prop must be of type number, string or array`)
    }

    return
  }

  return { name, offset: 0, shape }
}

/**
 * Sorts an array of Shapes, ShapesWithOptions and TimelineOptions.
 *
 * @param {(Shape|Object[]|TimelineOptions)[]} props
 *
 * @returns {SortedTimelineProps}
 *
 * @example
 * sort(props)
 */
const sort = props => {
  if (__DEV__ && props.length === 0) {
    throw new TypeError(
      `The timeline function must be passed at least one Shape`
    )
  }

  const { options, shapesWithOptions } = props.reduce((current, prop, i) => {
    if (Array.isArray(prop)) {
      current.shapesWithOptions.push(
        shapeWithOptionsFromArray(prop, i)
      )
    } else {
      if (__DEV__ && typeof prop !== 'object') {
        throw new TypeError(`The timeline function must only be passed objects and arrays`)
      }

      if (prop.keyframes) {
        current.shapesWithOptions.push({
          name: i,
          offset: config.defaults.timeline.queue,
          shape: prop
        })
      } else {
        if (__DEV__) {
          if (i === 0) {
            throw new TypeError(`The timeline function must receive a Shape as the first argument`)
          } else if (i !== props.length - 1) {
            throw new TypeError(`The timeline function must receive options as the final argument`)
          }
        }

        current.options = clone(prop)
      }
    }

    return current
  }, { options: {}, shapesWithOptions: [] })

  return {
    middleware: validMiddleware(options),
    playbackOptions: validPlaybackOptions(options),
    shapesWithOptions
  }
}

/**
 * Creates a Timeline from one or more Shape.
 * Optionally can take an options object as the last argument,
 * as well as options for each Shape if passed in as an array.
 *
 * @param {(Shape|Object[]|TimelineOptions)[]} props
 *
 * @returns {Timeline}
 *
 * @example
 * timeline(circle, [ square, { queue: -200 } ], { duration: 5000 })
 */
const timeline = (...props) => {
  const { middleware, playbackOptions, shapesWithOptions } = sort(props)
  const { duration, timelineShapes } = timelineShapesAndDuration(shapesWithOptions, middleware)

  if (typeof playbackOptions.duration === 'undefined') {
    playbackOptions.duration = duration
  }

  const t = { middleware, playbackOptions, state: {}, timelineShapes }

  timelineShapes.map(({ shape }, i) => {
    shape.timeline = t
    shape.timelineIndex = i
  })

  return t
}

/**
 * Converts a set of MsTimelineShapes to a set of TimelineShapes
 * given the Timeline start and total duration values.
 *
 * @param {Object} props
 * @param {number} props.duration
 * @param {msTimelineShape[]} props.msTimelineShapes
 * @param {number} props.start
 *
 * @returns {TimelineShape[]}
 *
 * @example
 * timelineShapes()
 */
const timelineShapes = ({ duration, msTimelineShapes, start }) => (
  msTimelineShapes.map(({ shape, timelinePosition }) => ({
    shape,
    timelinePosition: {
      start: (timelinePosition.start - start) / duration,
      end: (timelinePosition.end - start) / duration
    }
  }))
)

/**
 * Converts an array of ShapesWithOptions into TimelineShapes
 * and their total duration.
 *
 * @param {ShapeWithOptions[]} shapesWithOptions
 * @param {Middleware[]} middleware
 *
 * @returns {TimelineShapesAndDuration}
 *
 * @example
 * timelineShapes(shapesWithOptions)
 */
const timelineShapesAndDuration = (shapesWithOptions, middleware) => {
  let timelineStart = 0
  let timelineEnd = 0

  const msTimelineShapes = []

  shapesWithOptions.map(({ follow, name, offset, shape }, i) => {
    if (__DEV__ && typeof shape.timeline !== 'undefined') {
      throw new Error(`A Shape can only be added to one timeline`)
    }

    apply(shape, middleware)

    if (typeof name !== 'undefined') {
      shape.name = name
    } else if (typeof shape.name === 'undefined') {
      shape.name = i
    }

    const start = shapeStart({
      follow,
      msTimelineShapes,
      offset,
      timelineEnd
    })

    const end = start + shape.duration

    timelineStart = Math.min(timelineStart, start)
    timelineEnd = Math.max(timelineEnd, end)

    msTimelineShapes.push({ shape, timelinePosition: { start, end } })
  })

  const timelineDuration = Math.abs(timelineStart - timelineEnd)

  return {
    duration: timelineDuration,
    timelineShapes: timelineShapes({
      duration: timelineDuration,
      msTimelineShapes,
      start: timelineStart
    })
  }
}

/**
 * Updates the PlaybackOptions of a Timeline.
 *
 * @param {Timeline} timeline
 * @param {PlaybackOptions} playbackOptions
 * @param {number} [at]
 *
 * @example
 * updatePlaybackOptions(timeline, { initialIterations: 0 })
 */
const updatePlaybackOptions = (timeline, playbackOptions, at) => {
  if (__DEV__ && (typeof timeline !== 'object' || !timeline.timelineShapes || !timeline.playbackOptions)) {
    throw new TypeError(`The play function's first argument must be a Timeline`)
  }

  if (__DEV__ && (typeof at !== 'undefined' && typeof at !== 'number')) {
    throw new TypeError(`The play function's third argument must be of type number`)
  }

  const previous = timeline.playbackOptions

  const next = validPlaybackOptions({
    ...previous,
    ...playbackOptions,
    started: typeof at !== 'undefined' ? at : Date.now()
  })

  if (typeof playbackOptions.initialIterations !== 'undefined') {
    if (typeof playbackOptions.reverse === 'undefined') {
      next.reverse = currentReverse({
        ...previous,
        complete: next.initialIterations - previous.initialIterations
      })
    }

    if (
      typeof playbackOptions.iterations === 'undefined' &&
      previous.iterations !== Infinity
    ) {
      next.iterations = Math.max(0, previous.initialIterations + previous.iterations - next.initialIterations)
    }
  } else {
    const complete = iterationsComplete({ ...previous, at: next.started })
    const reverse = currentReverse({ ...previous, complete })

    next.initialIterations = previous.initialIterations + complete

    if (typeof playbackOptions.iterations === 'undefined') {
      next.iterations = previous.iterations - complete

      if (typeof playbackOptions.reverse !== 'undefined' && next.reverse !== previous.reverse && next.iterations !== Infinity) {
        const nextIterations = next.initialIterations
        next.initialIterations = next.iterations
        next.iterations = nextIterations
      }
    } else {
      if (
        typeof playbackOptions.reverse !== 'undefined' &&
        playbackOptions.reverse !== reverse &&
        next.iterations !== Infinity
      ) {
        next.initialIterations = previous.iterations - complete
      }
    }

    if (typeof playbackOptions.reverse === 'undefined') {
      next.reverse = reverse
    } else if (next.iterations === Infinity) {
      next.initialIterations = playbackOptions.reverse === reverse
        ? next.initialIterations % 1
        : 1 - next.initialIterations % 1
    }
  }

  return next
}

/**
 * Extracts and validates Middlware from an object.
 *
 * @param {Object} opts
 *
 * @returns {Middleware[]}
 *
 * @example
 * validMiddleware(opts)
 */
const validMiddleware = ({ middleware = config.defaults.timeline.middleware }) => {
  if (!Array.isArray(middleware)) {
    throw new TypeError(`The timeline function middleware option must be of type array`)
  }

  middleware.map(({ name, input, output }) => {
    if (typeof name !== 'string') {
      throw new TypeError(`A middleware must have a name prop`)
    }

    if (typeof input !== 'function') {
      throw new TypeError(`The ${name} middleware must have an input method`)
    }

    if (typeof output !== 'function') {
      throw new TypeError(`The ${name} middleware must have an output method`)
    }
  })

  return middleware
}

/**
 * Extracts and validates PlaybackOptions from an object.
 *
 * @param {Object} opts
 *
 * @returns {PlaybackOptions}
 *
 * @example
 * validPlaybackOptions(opts)
 */
const validPlaybackOptions = ({
  alternate = config.defaults.timeline.alternate,
  duration,
  initialIterations = config.defaults.timeline.initialIterations,
  iterations = config.defaults.timeline.iterations,
  reverse = config.defaults.timeline.reverse,
  started
}) => {
  const playbackOptions = {}

  if (typeof duration !== 'undefined') {
    if (__DEV__ && (typeof duration !== 'number' || duration < 0)) {
      throw new TypeError(`The timeline function duration option must be a positive number or zero`)
    }

    playbackOptions.duration = duration
  }

  if (__DEV__) {
    if (typeof alternate !== 'boolean') {
      throw new TypeError(`The timeline function alternate option must be true or false`)
    }

    if (typeof initialIterations !== 'number' || initialIterations < 0) {
      throw new TypeError(`The timeline function initialIterations option must be a positive number or zero`)
    }

    if (typeof iterations !== 'number' || iterations < 0) {
      throw new TypeError(`The timeline function iterations option must be a positive number or zero`)
    }

    if (typeof reverse !== 'boolean') {
      throw new TypeError(`The timeline function reverse option must be true or false`)
    }
  }

  if (typeof started !== 'undefined') {
    if (__DEV__ && (typeof started !== 'number' || started < 0)) {
      throw new TypeError(`The timeline function started option must be a positive number or zero`)
    }

    playbackOptions.started = started
  }

  return {
    ...playbackOptions,
    alternate,
    initialIterations,
    iterations,
    reverse
  }
}

export { currentReverse, pause, play, position, sameDirection }
export default timeline

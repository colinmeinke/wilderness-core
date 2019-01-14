/* globals __DEV__ */

import config from './config'
import { input } from './middleware'
import { createEvents } from './events'

/**
 * The position of an object on a Timeline
 * where 0 is Timeline start and 1 is Timeline finish.
 *
 * @typedef {Object} TimelinePosition
 *
 * @property {Position} start
 * @property {Position} finish
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
 * @property {number} finish.
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
 * @property {(string|number)} [after] - The name of the Shape to queue after (in sequence).
 * @property {(string|number)} [at] - The name of the Shape to queue at (in parallel).
 * @property {(string|number)} name - A unique reference.
 * @property {number} offset - The offset in milliseconds to adjust the queuing of this shape.
 * @property {Shape} shape
 */

/**
 * An object containing EventSubscriptions, Middlware, PlaybackOptions and
 * ShapesWithOptions.
 *
 * @typedef {Object} SortedTimelineProps
 *
 * @property {EventSubscription[]} events
 * @property {Middleware[]} middleware
 * @property {PlaybackOptions} playbackOptions
 * @property {ShapeWithOptions[]} shapesWithOptions
 */

/**
 * A sequence of Shapes.
 *
 * @typedef {Object} Timeline
 *
 * @property {EventsObject} [events]
 * @property {Middleware[]} [middleware]
 * @property {PlaybackOptions} playbackOptions
 * @property {Object} state - Holds the last known state of the timeline.
 * @property {TimelineShape[]} timelineShapes
 */

/**
 * Accepted event names.
 */
const acceptedEventNames = [
  'timeline.start',
  'timeline.finish',
  'shape.start',
  'shape.finish',
  'keyframe',
  'frame'
]

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
  for (let i = 0, l = keyframes.length; i < l; i++) {
    const keyframe = keyframes[ i ]
    keyframe.frameShape = input(keyframe.frameShape, middleware)
  }
}

/**
 * Is playback currently in reverse?
 *
 * @param {PlaybackOptions} playbackOptions
 * @param {number} complete - The number of iterations complete.
 *
 * @example
 * currentReverse(playbackOptions, complete)
 */
const currentReverse = (playbackOptions, complete) => {
  const reverse = playbackOptions.reverse

  if (complete === 0) {
    return reverse
  }

  const alternate = playbackOptions.alternate
  const initialIterations = playbackOptions.initialIterations

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
 * @param {PlaybackOptions} playbackOptions
 * @param {number} opts.at
 *
 * @returns {number}
 *
 * @example
 * iterationsComplete(playbackOptions, 1000)
 */
const iterationsComplete = (playbackOptions, at) => {
  const duration = playbackOptions.duration
  const iterations = playbackOptions.iterations
  const started = playbackOptions.started

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
  timeline.playbackOptions = updatePlaybackOptions({ at, timeline, pause: true, playbackOptions })
  updateState(timeline, at)
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
  timeline.playbackOptions = updatePlaybackOptions({ at, timeline, playbackOptions })
  updateState(timeline, at)
}

/**
 * Calculate the Timeline Position.
 *
 * @param {number} totalIterations - initialIterations + iterationsComplete.
 * @param {boolean} reverse - Is the Timeline currently in reverse?
 *
 * @returns {Position}
 *
 * @example
 * position(5.43, true)
 */
const position = (totalIterations, reverse) => {
  const i = totalIterations >= 1 && totalIterations % 1 === 0
    ? 1
    : totalIterations % 1

  return reverse ? 1 - i : i
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
 * @param {(string|number)} [props.after]
 * @param {(string|number)} [props.at]
 * @param {MsTimelineShape[]} props.msTimelineShapes
 * @param {number} props.offset
 * @param {number} props.timelineFinish - The current finish of the timeline.
 *
 * @returns {number}
 *
 * @example
 * shapeStart({ 'foo', msTimelineShapes, 200, 2000 })
 */
const shapeStart = ({ after, at, msTimelineShapes, offset, timelineFinish }) => {
  if (typeof after !== 'undefined' || typeof at !== 'undefined') {
    const reference = typeof after !== 'undefined' ? after : at

    for (let i = 0; i < msTimelineShapes.length; i++) {
      const s = msTimelineShapes[ i ]

      if (reference === s.shape.name) {
        return (typeof at !== 'undefined'
          ? s.timelinePosition.start
          : s.timelinePosition.finish) + offset
      }
    }

    for (let i = 0; i < msTimelineShapes.length; i++) {
      const s = msTimelineShapes[ i ]

      for (let j = 0; j < s.shape.keyframes.length; j++) {
        const keyframe = s.shape.keyframes[ j ]

        if (reference === keyframe.name) {
          return s.timelinePosition.start +
            s.shape.duration * keyframe.position + offset
        }
      }
    }

    if (__DEV__) {
      throw new Error(`No Shape or Keyframe matching name '${reference}'`)
    }
  }

  return timelineFinish + offset
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

  if (typeof queue === 'object' && (!Array.isArray(queue) && queue !== null)) {
    const { after, at, offset = 0 } = queue

    if (__DEV__ && (typeof offset !== 'undefined' && typeof offset !== 'number')) {
      throw new TypeError(`The queue.offset prop must be of type number`)
    }

    if (__DEV__ && (typeof at !== 'undefined' && typeof after !== 'undefined')) {
      throw new TypeError(`You cannot pass both queue.at and queue.after props`)
    }

    if (__DEV__ && (typeof at !== 'undefined' && typeof at !== 'string' && typeof at !== 'number')) {
      throw new TypeError(`The queue.at prop must be of type string or number`)
    }

    if (__DEV__ && (typeof after !== 'undefined' && typeof after !== 'string' && typeof after !== 'number')) {
      throw new TypeError(`The queue.after prop must be of type string or number`)
    }

    if (typeof at !== 'undefined') {
      return { at, name, offset, shape }
    }

    if (typeof after !== 'undefined') {
      return { after, name, offset, shape }
    }

    return { name, offset, shape }
  } else if (typeof queue === 'number') {
    return { name, offset: queue, shape }
  } else if (typeof queue === 'string') {
    return { after: queue, name, offset: 0, shape }
  }

  if (__DEV__) {
    throw new TypeError(`The queue prop must be of type number, string or object`)
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

  const sorted = {
    events: [],
    middleware: config.defaults.timeline.middleware,
    playbackOptions: {
      alternate: config.defaults.timeline.alternate,
      initialIterations: config.defaults.timeline.initialIterations,
      iterations: config.defaults.timeline.iterations,
      reverse: config.defaults.timeline.reverse
    },
    shapesWithOptions: []
  }

  for (let i = 0, l = props.length; i < l; i++) {
    const prop = props[ i ]

    if (Array.isArray(prop)) {
      sorted.shapesWithOptions.push(shapeWithOptionsFromArray(prop, i))
    } else {
      if (__DEV__ && typeof prop !== 'object') {
        throw new TypeError(`The timeline function must only be passed objects and arrays`)
      }

      if (prop.keyframes) {
        sorted.shapesWithOptions.push({
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

        if (prop.middleware) {
          sorted.middleware = validMiddleware(prop.middleware)
        }

        if (prop.events) {
          sorted.events = validEvents(prop.events)
        }

        sorted.playbackOptions = validPlaybackOptions({
          ...sorted.playbackOptions,
          ...prop
        })
      }
    }
  }

  return sorted
}

/**
 * Creates a Timeline from one or more Shape.
 * Optionally can take an options object as the last argument,
 * as well as options for each Shape if passed in as an array.
 *
 * @param {...(Shape|Object[]|TimelineOptions)} props
 *
 * @returns {Timeline}
 *
 * @example
 * timeline(circle, [ square, { queue: -200 } ], { duration: 5000 })
 */
const timeline = (...props) => {
  const { events, middleware, playbackOptions, shapesWithOptions } = sort(props)
  const { duration, timelineShapes } = timelineShapesAndDuration(shapesWithOptions, middleware)

  if (typeof playbackOptions.duration === 'undefined') {
    playbackOptions.duration = duration
  }

  const t = { playbackOptions, state: {}, timelineShapes }

  for (let i = 0, l = timelineShapes.length; i < l; i++) {
    const shape = timelineShapes[ i ].shape

    shape.timeline = t
    shape.timelineIndex = i
  }

  if (middleware.length) {
    t.middleware = middleware
  }

  updateState(t)

  if (events.length) {
    t.events = createEvents(events)
  }

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
const timelineShapes = ({ duration, msTimelineShapes, start }) => {
  const s = []

  for (let i = 0, l = msTimelineShapes.length; i < l; i++) {
    const msTimelineShape = msTimelineShapes[ i ]
    const timelinePosition = msTimelineShape.timelinePosition

    s.push({
      shape: msTimelineShape.shape,
      timelinePosition: {
        start: (timelinePosition.start - start) / duration,
        finish: (timelinePosition.finish - start) / duration
      }
    })
  }

  return s
}

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
  let timelineFinish = 0

  const msTimelineShapes = []

  for (let i = 0, l = shapesWithOptions.length; i < l; i++) {
    const { after, at, name, offset, shape } = shapesWithOptions[ i ]

    if (__DEV__ && typeof shape.timeline !== 'undefined') {
      throw new Error(`A Shape can only be added to one timeline`)
    }

    shape.name = name

    if (middleware.length) {
      apply(shape, middleware)
    }

    const start = shapeStart({
      after,
      at,
      msTimelineShapes,
      offset,
      timelineFinish
    })

    const finish = start + shape.duration

    timelineStart = Math.min(timelineStart, start)
    timelineFinish = Math.max(timelineFinish, finish)

    msTimelineShapes.push({ shape, timelinePosition: { start, finish } })
  }

  const timelineDuration = Math.abs(timelineStart - timelineFinish)

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
 * @param {Object} opts
 * @param {number} [opts.at]
 * @param {PlaybackOptions} opts.playbackOptions
 * @param {Timeline} opts.timeline
 *
 * @example
 * updatePlaybackOptions({ timeline, playbackOptions })
 */
const updatePlaybackOptions = ({ at, pause = false, playbackOptions, timeline }) => {
  if (__DEV__ && (typeof timeline !== 'object' || !timeline.timelineShapes || !timeline.playbackOptions)) {
    throw new TypeError(`The updatePlaybackOptions function must be passed a Timeline`)
  }

  if (__DEV__ && (typeof at !== 'undefined' && typeof at !== 'number')) {
    throw new TypeError(`The updatePlaybackOptions function at property must be of type number`)
  }

  const previous = timeline.playbackOptions

  const next = validPlaybackOptions({
    ...previous,
    ...playbackOptions,
    started: typeof at !== 'undefined' ? at : Date.now()
  })

  if (typeof playbackOptions.initialIterations !== 'undefined') {
    if (typeof playbackOptions.reverse === 'undefined') {
      next.reverse = currentReverse(previous, next.initialIterations - previous.initialIterations)
    }

    if (
      typeof playbackOptions.iterations === 'undefined' &&
      previous.iterations !== Infinity
    ) {
      next.iterations = Math.max(0, previous.initialIterations + previous.iterations - next.initialIterations)
    }
  } else {
    const complete = iterationsComplete(previous, next.started)
    const reverse = currentReverse(previous, complete)

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

  if (pause) {
    delete next.started
  }

  return next
}

/**
 * Updates the Timeline state.
 *
 * @param {Timeline} timeline
 * @param {number} at
 *
 * @example
 * updateState(timeline, Date.now())
 */
const updateState = (t, at) => {
  const playbackOptions = t.playbackOptions
  const state = t.state

  state.started = typeof playbackOptions.started !== 'undefined'
  state.iterationsComplete = iterationsComplete(playbackOptions, at)
  state.totalIterations = playbackOptions.initialIterations + state.iterationsComplete
  state.reverse = currentReverse(playbackOptions, state.iterationsComplete)
  state.finished = playbackOptions.iterations - state.iterationsComplete === 0
  state.position = position(state.totalIterations, state.reverse)
}

/**
 * Extracts and validates events from an object.
 *
 * @param {Object} opts
 *
 * @returns {Object[]}
 *
 * @example
 * validEvents(opts)
 */
const validEvents = events => {
  if (!Array.isArray(events)) {
    if (__DEV__) {
      throw new TypeError(`The timeline function events option must be of type array`)
    }

    return []
  }

  const valid = []

  for (let i = 0, l = events.length; i < l; i++) {
    const event = events[ i ]
    const name = event[ 0 ]

    if (typeof name !== 'string') {
      if (__DEV__) {
        throw new TypeError(`An event must have a name string as the first item`)
      }
    } else if (typeof event[ 1 ] !== 'function') {
      if (__DEV__) {
        throw new TypeError(`The ${name} event must have an callback function`)
      }
    } else {
      if (acceptedEventNames.indexOf(name) !== -1) {
        valid.push(event)
      }
    }
  }

  return valid
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
const validMiddleware = middleware => {
  if (!Array.isArray(middleware)) {
    throw new TypeError(`The timeline function middleware option must be of type array`)
  }

  for (let i = 0, l = middleware.length; i < l; i++) {
    const { name, input, output } = middleware[ i ]

    if (typeof name !== 'string') {
      throw new TypeError(`A middleware must have a name prop`)
    }

    if (typeof input !== 'function') {
      throw new TypeError(`The ${name} middleware must have an input method`)
    }

    if (typeof output !== 'function') {
      throw new TypeError(`The ${name} middleware must have an output method`)
    }
  }

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
  alternate,
  duration,
  initialIterations,
  iterations,
  reverse,
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

export {
  currentReverse,
  iterationsComplete,
  pause,
  play,
  position,
  sameDirection,
  updateState
}

export default timeline

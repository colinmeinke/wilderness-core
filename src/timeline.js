import config from './config'

/**
 * The position of an object on a Timeline
 * where 0 is Timeline start and 1 is Timeline end.
 *
 * @typedef {Object} TimelinePosition
 *
 * @property {number} start - A number between 0 and 1 (inclusive).
 * @property {number} end - A number between 0 and 1 (inclusive).
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
 * The options required to calculate the current playback position
 * between 0 to 1, at any point in time.
 *
 * @typedef {Object} PlaybackOptions
 *
 * @property {boolean} alternate - Should the next iteration reverse current direction?
 * @property {number} delay - Milliseconds before playback starts.
 * @property {number} duration - Milliseconds that each iteration lasts.
 * @property {number} initialIterations - The starting number of iterations.
 * @property {number} iterations - The number of playback interations (additional to initialIterations).
 * @property {boolean} reverse - Should the first iteration start in a reverse direction?
 * @property {number} [started] - The UNIX timestamp of playback start.
 */

/**
 * Playback Options and tween middleware.
 *
 * @typedef {Object} TimelineOptions
 *
 * @extends PlaybackOptions
 * @property {Object[]} middleware
 */

/**
 * A Shape and timeline related options.
 *
 * @typedef {Object} ShapeWithOptions
 *
 * @property {Shape} shape
 * @property {(string|number)} name
 * @property {((string|number)[]|number)} queue
 */

/**
 * An object containing Shapes With Options and Timeline Options.
 *
 * @typedef {Object} SortedTimelineProps
 *
 * @property {ShapeWithOptions[]} shapesWithOptions
 * @property {TimelineOptions} timelineOptions
 */

/**
 * A sequence of Shapes.
 *
 * @typedef {Object} Timeline
 *
 * @property {TimelineShape[]} timelineShapes
 * @property {PlaybackOptions} playbackOptions
 */

/**
 * Extracts Playback Options from Timeline Options.
 *
 * @param {TimelineOptions} opts
 *
 * @returns {PlaybackOptions}
 *
 * @example
 * playbackOptsFromTimelineOpts(timelineOptions)
 */
const playbackOptsFromTimelineOpts = ({
  alternate,
  delay,
  duration,
  initialIterations,
  iterations,
  middleware,
  reverse,
  started
}) => {
  const playbackOptions = {
    alternate,
    delay,
    duration,
    initialIterations,
    iterations,
    reverse
  }

  if (typeof started !== 'undefined') {
    playbackOptions.started = started
  }

  return playbackOptions
}

/**
 * Create a Shape With Options from an array.
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
  if (typeof shape !== 'object' || !shape.keyframes) {
    throw new TypeError(`When an array is passed to the timeline function the first item must be a Shape`)
  }

  if (typeof options !== 'object') {
    throw new TypeError(`When an array is passed to the timeline function the second item must be an object`)
  }

  const { name = i, queue = config.defaults.timeline.queue } = options

  if (typeof name !== 'string' && typeof name !== 'number') {
    throw new TypeError(`The name prop must be of type string or number`)
  }

  if (Array.isArray(queue)) {
    if (typeof queue[ 0 ] !== 'string') {
      throw new TypeError(`The queue prop first array item must be of type string`)
    }

    if (typeof queue[ 1 ] !== 'number') {
      throw new TypeError(`The queue prop second array item must be of type number`)
    }
  } else if (typeof queue !== 'number') {
    throw new TypeError(`The queue prop must be of type number or array`)
  }

  return { name, queue, shape }
}

/**
 * Sorts an array of props Shapes With Options and Timeline Options.
 *
 * @param {(Shape|Object[]|TimelineOptions)[]} props
 *
 * @returns {SortedTimelineProps}
 *
 * @example
 * sort(props)
 */
const sort = props => {
  if (props.length === 0) {
    throw new TypeError(
      `The timeline function must be passed at least one Shape`
    )
  }

  const { shapesWithOptions, options } = props.reduce((current, prop, i) => {
    if (Array.isArray(prop)) {
      current.shapesWithOptions.push(
        shapeWithOptionsFromArray(prop, i)
      )
    } else {
      if (typeof prop !== 'object') {
        throw new TypeError(`The timeline function must only be passed objects and arrays`)
      }

      if (prop.keyframes) {
        current.shapesWithOptions.push({
          name: i,
          queue: config.defaults.timeline.queue,
          shape: prop
        })
      } else {
        if (i === 0) {
          throw new TypeError(`The timeline function must receive a Shape as the first argument`)
        } else if (i !== props.length - 1) {
          throw new TypeError(`The timeline function must receive options as the final argument`)
        }

        current.options = { ...prop }
      }
    }

    return current
  }, { shapesWithOptions: [], options: {} })

  return {
    shapesWithOptions,
    timelineOptions: timelineOptions(options)
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
  const { shapesWithOptions, timelineOptions } = sort(props)

  return {
    playbackOptions: playbackOptsFromTimelineOpts(timelineOptions),
    timelineShapes: shapesWithOptions.map(({ name, queue, shape }) => ({
      shape,
      timelinePosition: {
        start: 0,
        end: 1
      }
    }))
  }
}

/**
 * Validates Timeline Options.
 *
 * @param {TimelineOptions} options
 *
 * @returns {TimelineOptions}
 *
 * @example
 * timelineOptions(options)
 */
const timelineOptions = options => {
  const t = {}

  const {
    alternate = config.defaults.timeline.alternate,
    delay = config.defaults.timeline.delay,
    duration,
    initialIterations = config.defaults.timeline.initialIterations,
    iterations = config.defaults.timeline.iterations,
    reverse = config.defaults.timeline.reverse,
    started
  } = options

  if (typeof alternate !== 'boolean') {
    throw new TypeError(`The timeline function alternate option must be true or false`)
  }

  if (typeof delay !== 'number' || delay < 0) {
    throw new TypeError(`The timeline function delay option must be a positive number or zero`)
  }

  if (typeof duration === 'undefined') {
    t.duration = 1000
  } else if (typeof duration !== 'number' || duration < 0) {
    throw new TypeError(`The timeline function duration option must be a positive number or zero`)
  } else {
    t.duration = duration
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

  if (typeof started !== 'undefined') {
    if (typeof started !== 'number' || started < 0) {
      throw new TypeError(`The timeline function started option must be a positive number or zero`)
    }

    t.started = started
  }

  t.alternate = alternate
  t.delay = delay
  t.initialIterations = initialIterations
  t.iterations = iterations
  t.reverse = reverse

  return t
}

export default timeline

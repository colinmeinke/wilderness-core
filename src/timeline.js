import config from './config'

/**
 * A sequence of Shapes.
 *
 * @typedef {Object} Timeline
 *
 * @property {TimelineShape[]} timelineShapes
 * @property {PlaybackOptions} playbackOptions
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
 * The position of an object on a Timeline
 * where 0 is Timeline start and 1 is Timeline end.
 *
 * @typedef {Object} TimelinePosition
 *
 * @property {number} start - A number between 0 and 1 (inclusive).
 * @property {number} end - A number between 0 and 1 (inclusive).
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

const sort = props => {
  const shapesWithOptions = []

  let opts = {}

  if (props.length === 0) {
    throw new TypeError(
      `The timeline function must be passed at least one Shape`
    )
  }

  props.map((prop, i) => {
    if (Array.isArray(prop)) {
      if (typeof prop[ 0 ] !== 'object' || !prop[ 0 ].keyframes) {
        throw new TypeError(`When an array is passed to the timeline function the first item must be a Shape`)
      }

      if (typeof prop[ 1 ] !== 'object') {
        throw new TypeError(`When an array is passed to the timeline function the second item must be an object`)
      }

      // Valid shape array
    } else {
      if (typeof prop !== 'object') {
        throw new TypeError(`The timeline function must only be passed objects and arrays`)
      }

      if (prop.keyframes) {
        // Valid shape object
      } else {
        if (i === 0) {
          throw new TypeError(`The timeline function must receive a Shape as the first argument`)
        } else if (i !== props.length - 1) {
          throw new TypeError(`The timeline function must receive options as the final argument`)
        }

        // Valid options object
        opts = { ...prop }
      }
    }
  })

  const timelineOptions = {}

  const {
    alternate = config.defaults.timeline.alternate,
    delay = config.defaults.timeline.delay,
    duration,
    initialIterations = config.defaults.timeline.initialIterations,
    iterations = config.defaults.timeline.iterations,
    reverse = config.defaults.timeline.reverse,
    started
  } = opts

  if (typeof alternate !== 'boolean') {
    throw new TypeError(`The timeline function alternate option must be true or false`)
  }

  if (typeof delay !== 'number' || delay < 0) {
    throw new TypeError(`The timeline function delay option must be a positive number or zero`)
  }

  if (typeof duration === 'undefined') {
    timelineOptions.duration = 1000
  } else if (typeof duration !== 'number' || duration < 0) {
    throw new TypeError(`The timeline function duration option must be a positive number or zero`)
  } else {
    timelineOptions.duration = duration
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

    timelineOptions.started = started
  }

  timelineOptions.alternate = alternate
  timelineOptions.delay = delay
  timelineOptions.initialIterations = initialIterations
  timelineOptions.iterations = iterations
  timelineOptions.reverse = reverse

  return { shapesWithOptions, timelineOptions }
}

const timeline = (...props) => {
  const {
    shapesWithOptions,
    timelineOptions: {
      alternate,
      delay,
      duration,
      initialIterations,
      iterations,
      reverse,
      started
    }
  } = sort(props)

  const playbackOptions = {
    alternate,
    delay,
    duration,
    initialIterations,
    iterations,
    reverse
  }

  if (typeof started !== undefined) {
    playbackOptions.started = started
  }

  return {
    playbackOptions,
    timelineShapes: shapesWithOptions.map(shape => ({
      shape,
      timelinePosition: {
        start: 0,
        end: 1
      }
    }))
  }
}

export default timeline

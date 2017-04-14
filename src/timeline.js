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
  if (props.length === 0) {
    throw new TypeError(
      `The timeline function must be passed at least one Shape`
    )
  }

  return { shapes: props, playbackOptions: {} }
}

const timeline = (...props) => {
  const {
    shapes,
    playbackOptions: {
      alternate,
      delay,
      duration,
      initialIterations,
      iterations,
      reverse,
      started
    }
  } = sort(props)

  return {
    timelineShapes: shapes.map(shape => ({
      shape,
      timelinePosition: {
        start: 0,
        end: 1
      }
    })),
    playbackOptions: {
      alternate,
      delay,
      duration,
      initialIterations,
      iterations,
      reverse,
      started
    }
  }
}

export default timeline

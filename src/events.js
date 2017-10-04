import {
  currentReverse,
  iterationsComplete,
  position as getPosition
} from './timeline'

/**
 * An event.
 *
 * @typedef {array} Event
 *
 * @property {string} 0 - The event name.
 * @property {number} 1 - The time the event occured.
 * @property {...*} - Arguments to be passed to the callback functions.
 */

/**
 * A Timeline event subscription.
 *
 * @typedef {array} EventSubscription
 *
 * @property {string} 0 - The name of the Event.
 * @property {function} 1 - The callback to run when an Event occurs.
 */

/**
 * An object to hold Timeline EventSubscriptions.
 *
 * @typedef {Object} EventsObject
 *
 * @property {Object} previousPlaybackOptions
 * @property {Object} previousState
 * @property {EventSubscription[]} subscriptions
 */

/**
 * Is a Timeline active?
 *
 * @param {Timeline} timeline
 *
 * @returns {boolean}
 *
 * @example
 * active(timeline)
 */
const active = ({ events, state }) => (
  state.started &&
  (!state.finished || typeof events.previousState === 'undefined' || !events.previousState.finished)
)

/**
 * An EventsObject creator.
 *
 * @param {EventSubscription[]} subscriptions
 *
 * @returns {EventsObject}
 *
 * @example
 * createEvents(subscriptions)
 */
const createEvents = subscriptions => ({
  eventNames: eventNames(subscriptions),
  previousPlaybackOptions: {},
  previousState: {},
  subscriptions
})

/**
 * A unique list of Timeline EventSubscription names.
 *
 * @param {EventSubscription[]} subscriptions
 *
 * @returns {string[]}
 *
 * @example
 * eventNames(subscriptions)
 */
const eventNames = subscriptions => {
  const names = []

  for (let i = 0, l = subscriptions.length; i < l; i++) {
    const name = subscriptions[ i ][ 0 ]

    if (names.indexOf(name) === -1) {
      names.push(name)
    }
  }

  return names
}

/**
 * Run EventSubscription callbacks for every event that has occured since
 * last check.
 *
 * @param {Timeline} timeline
 *
 * @example
 * flushEvents(timeline)
 */
const flushEvents = timeline => {
  if (playbackOptionsChanged(timeline)) {
    timeline.events.previousPlaybackOptions = {}
    timeline.events.previousState = {}
  }

  if (active(timeline)) {
    const subscriptions = timeline.events.subscriptions
    const queue = eventQueue(timeline)

    for (let i = 0, l = queue.length; i < l; i++) {
      const [ eventName, , ...args ] = queue[ i ]

      for (let _i = 0, _l = subscriptions.length; _i < _l; _i++) {
        const subscription = subscriptions[ _i ]

        if (eventName === subscription[ 0 ]) {
          subscription[ 1 ](...args)
        }
      }
    }
  }

  timeline.events.previousPlaybackOptions = { ...timeline.playbackOptions }
  timeline.events.previousState = { ...timeline.state }
}

/**
 * An array of Events that have occured since last checked.
 *
 * @param {Timeline} timeline
 *
 * @returns {Event[]}
 *
 * @example
 * eventQueue(timeline)
 */
const eventQueue = ({ events: { eventNames, previousState }, playbackOptions, state, timelineShapes }) => {
  const queue = []
  const { alternate, duration, initialIterations, iterations, reverse, started } = playbackOptions
  const max = started + (duration * state.iterationsComplete)
  const min = typeof previousState.iterationsComplete !== 'undefined'
    ? started + (duration * previousState.iterationsComplete) + 1
    : 0

  const getTimestamps = pos => positionTimestamps({
    alternate,
    duration,
    initialIterations,
    iterations,
    max,
    min,
    position: pos,
    reverse,
    started
  })

  if (eventNames.indexOf('timeline.start') !== -1) {
    const timestamps = getTimestamps(0)

    for (let i = 0, l = timestamps.length; i < l; i++) {
      queue.push([ 'timeline.start', timestamps[ i ] ])
    }
  }

  if (eventNames.indexOf('timeline.finish') !== -1) {
    const timestamps = getTimestamps(1)

    for (let i = 0, l = timestamps.length; i < l; i++) {
      queue.push([ 'timeline.finish', timestamps[ i ] ])
    }
  }

  if (eventNames.indexOf('shape.start') !== -1) {
    for (let i = 0, l = timelineShapes.length; i < l; i++) {
      const { shape: { name: shapeName }, timelinePosition: { start } } = timelineShapes[ i ]
      const timestamps = getTimestamps(start)

      for (let _i = 0, _l = timestamps.length; _i < _l; _i++) {
        queue.push([ 'shape.start', timestamps[ _i ], shapeName ])
      }
    }
  }

  if (eventNames.indexOf('shape.finish') !== -1) {
    for (let i = 0, l = timelineShapes.length; i < l; i++) {
      const { shape: { name: shapeName }, timelinePosition: { finish } } = timelineShapes[ i ]
      const timestamps = getTimestamps(finish)

      for (let _i = 0, _l = timestamps.length; _i < _l; _i++) {
        queue.push([ 'shape.finish', timestamps[ _i ], shapeName ])
      }
    }
  }

  if (eventNames.indexOf('keyframe') !== -1) {
    for (let i = 0, l = timelineShapes.length; i < l; i++) {
      const { shape: { name: shapeName, keyframes }, timelinePosition: { start, finish } } = timelineShapes[ i ]

      for (let _i = 0, _l = keyframes.length; _i < _l; _i++) {
        const { name: keyframeName, position } = keyframes[ _i ]

        const keyframePosition = start + (finish - start) * position
        const timestamps = getTimestamps(keyframePosition)

        for (let __i = 0, __l = timestamps.length; __i < __l; __i++) {
          queue.push([ 'keyframe', timestamps[ __i ], keyframeName, shapeName ])
        }
      }
    }
  }

  if (eventNames.indexOf('frame') !== -1) {
    queue.push([ 'frame', max ])
  }

  return queue.sort(oldest)
}

/**
 * A sort function for Events.
 *
 * @param {Event} a
 * @param {Event} b
 *
 * @returns {number}
 *
 * @example
 * oldest(event1, event2)
 */
const oldest = (a, b) => a[ 1 ] === b[ 1 ] ? 0 : (a[ 1 ] < b[ 1 ] ? -1 : 1)

/**
 * Have playbackOptions changed since last check?
 *
 * @param {Timeline} timeline
 *
 * @return {boolean}
 *
 * @example
 * playbackOptionsChanged(timeline)
 */
const playbackOptionsChanged = timeline => (
  JSON.stringify(timeline.playbackOptions) !== JSON.stringify(timeline.events.previousPlaybackOptions)
)

/**
 * Timestamps at which a Timeline was at a Position.
 *
 * @param {Object} opts
 * @param {boolean} opts.alternate
 * @param {number} opts.duration
 * @param {number} initialIterations
 * @param {number} iterations
 * @param {number} opts.max - The maximum bound within which to look for timestamps.
 * @param {number} opts.min - The minimum bound within which to look for timestamps.
 * @param {Position} opts.position - The Position in question.
 * @param {boolean} opts.reverse
 * @param {number} opts.started
 *
 * @returns {number[]}
 *
 * @example
 * positionTimestamps(opts)
 */
const positionTimestamps = ({
  alternate,
  duration,
  initialIterations,
  iterations,
  max,
  min,
  position,
  reverse,
  started
}) => {
  const startedPosition = getPosition(initialIterations, reverse)
  const finishedTimestamp = started + duration * iterations

  const timestamps = timestamp => {
    if (timestamp <= max) {
      const timestampReverse = currentReverse({
        alternate,
        initialIterations,
        iterations,
        reverse
      }, iterationsComplete({ duration, iterations, started }, timestamp))

      const positionAtEnd = position === 0 || position === 1
      const timelineFinished = timestamp === finishedTimestamp
      const finishedAtPosition = (position === 0 && timestampReverse) || (position === 1 && !timestampReverse)

      if (
        timestamp <= finishedTimestamp &&
        (!positionAtEnd || !timelineFinished || finishedAtPosition)
      ) {
        const t = timestamp >= min ? [ timestamp ] : []

        return t.concat(
          timestamps(timestamp + timeToSamePosition({
            alternate,
            duration,
            position,
            reverse: timestampReverse
          }))
        )
      }
    }

    return []
  }

  return timestamps(started + timeToPosition({
    alternate,
    duration,
    from: startedPosition,
    reverse,
    to: position
  }))
}

/**
 * The number of milliseconds between two Positions during Timeline playback.
 *
 * @param {Object} opts
 * @param {boolean} opts.alternate
 * @param {number} opts.duration
 * @param {Position} opts.from - The from Position.
 * @param {boolean} opts.reverse - Is Timeline in reverse at the from Position?
 * @param {Position} opts.to - The to Position.
 *
 * @returns {number}
 *
 * @example
 * timeToPosition(opts)
 */
const timeToPosition = ({ alternate, duration, from, reverse, to }) => (
  duration * (alternate
    ? reverse
      ? from < to ? to + from : from - to
      : from > to ? 2 - (to + from) : to - from
    : reverse
      ? from === 1 && to === 0 ? 1 : (1 - to + from) % 1
      : from === 0 && to === 1 ? 1 : (1 - from + to) % 1
  )
)

/**
 * The number of milliseconds between the same Position during Timeline playback.
 *
 * @param {Object} opts
 * @param {boolean} opts.alternate
 * @param {number} opts.duration
 * @param {Position} opts.position
 * @param {boolean} opts.reverse - Is Timeline in reverse at the Position?
 *
 * @returns {number}
 *
 * @example
 * timeToSamePosition(opts)
 */
const timeToSamePosition = ({ alternate, duration, position, reverse }) => (
  duration * (alternate
    ? reverse
      ? (position === 0 ? 1 : position) * 2
      : 2 - (position === 1 ? 0 : position) * 2
    : 1
  )
)

export {
  createEvents,
  eventNames,
  eventQueue,
  oldest,
  playbackOptionsChanged,
  positionTimestamps,
  timeToPosition,
  timeToSamePosition
}

export default flushEvents

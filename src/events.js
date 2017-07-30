/* globals __DEV__ */

import {
  currentReverse,
  iterationsComplete,
  position as getPosition
} from './timeline'

/**
 * An event.
 *
 * @typedef {Object} Event
 *
 * @property {number} at - The time the event occured.
 * @property {string} name - The event name.
 * @property {Object} options - Any additional event data.
 */

/**
 * A Timeline event subscription.
 *
 * @typedef {Object} EventSubscription
 *
 * @property {function} callback
 * @property {string} name
 * @property {number} token
 */

/**
 * An object to hold Timeline EventSubscriptions, and subscribe/unsubscribe functions.
 *
 * @typedef {Object} EventObject
 *
 * @property {Object} previousPlaybackOptions
 * @property {Object} previousState
 * @property {function} subscribe - A function to subscribe to Timeline events.
 * @property {EventSubscription[]} subscriptions
 * @property {function} unsubscribe - A function to unsubscribe to Timeline events.
 */

/**
 * Token incrementor.
 */
let t = 0

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
 * An EventObject creator.
 *
 * @param {Timeline} timeline
 *
 * @returns {EventObject}
 *
 * @example
 * event(timeline)
 */
const event = timeline => ({
  previousPlaybackOptions: {},
  previousState: {},
  subscribe: subscribe(timeline),
  subscriptions: [],
  unsubscribe: unsubscribe(timeline)
})

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
const active = ({ event, state }) => (
  state.started &&
  (!state.finished || typeof event.previousState === 'undefined' || !event.previousState.finished)
)

/**
 * A unique list of Timeline EventSubscription names.
 *
 * @param {Timeline} timeline
 *
 * @returns {string[]}
 *
 * @example
 * activeEventNames(timeline)
 */
const activeEventNames = ({ event: { subscriptions } }) => subscriptions
  .map(({ name }) => name)
  .reduce((a, x) => a.indexOf(x) === -1 ? a.concat(x) : a, [])

/**
 * Run EventSubscription callbacks for every event that has occured since last check.
 *
 * @param {Timeline} timeline
 *
 * @example
 * events(timeline)
 */
const events = timeline => {
  if (playbackOptionsChanged(timeline)) {
    timeline.event.previousPlaybackOptions = {}
    timeline.event.previousState = {}
  }

  if (timeline.event.subscriptions.length && active(timeline)) {
    const eventNames = activeEventNames(timeline)
    const queue = eventQueue(timeline, eventNames)

    queue.map(({ name: eventName, options = {} }) => {
      timeline.event.subscriptions.map(({ name, callback }) => {
        if (eventName === name) {
          callback(options)
        }
      })
    })
  }

  timeline.event.previousPlaybackOptions = { ...timeline.playbackOptions }
  timeline.event.previousState = { ...timeline.state }
}

/**
 * An array of Events that have occured since last checked.
 *
 * @param {Timeline} timeline
 * @param {string[]} eventNames
 *
 * @returns {Event[]}
 *
 * @example
 * eventQueue(timeline, eventNames)
 */
const eventQueue = ({ event: { previousState }, playbackOptions, state, timelineShapes }, eventNames) => {
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
    timestamps.map(at => queue.push({ name: 'timeline.start', at }))
  }

  if (eventNames.indexOf('timeline.finish') !== -1) {
    const timestamps = getTimestamps(1)
    timestamps.map(at => queue.push({ name: 'timeline.finish', at }))
  }

  if (eventNames.indexOf('shape.start') !== -1) {
    timelineShapes.map(({ shape: { name: shapeName }, timelinePosition: { start } }) => {
      const timestamps = getTimestamps(start)
      timestamps.map(at => queue.push({ name: 'shape.start', at, options: { shapeName } }))
    })
  }

  if (eventNames.indexOf('shape.finish') !== -1) {
    timelineShapes.map(({ shape: { name: shapeName }, timelinePosition: { finish } }) => {
      const timestamps = getTimestamps(finish)
      timestamps.map(at => queue.push({ name: 'shape.finish', at, options: { shapeName } }))
    })
  }

  if (eventNames.indexOf('keyframe') !== -1) {
    timelineShapes.map(({ shape: { name: shapeName, keyframes }, timelinePosition: { start, finish } }) => {
      keyframes.map(({ name: keyframeName, position }) => {
        const keyframePosition = start + (finish - start) * position
        const timestamps = getTimestamps(keyframePosition)
        timestamps.map(at => queue.push({name: 'keyframe', at, options: { keyframeName, shapeName }}))
      })
    })
  }

  if (eventNames.indexOf('frame') !== -1) {
    queue.push({ name: 'frame', at: max })
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
const oldest = (a, b) => a.at === b.at ? 0 : (a.at < b.at ? -1 : 1)

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
const playbackOptionsChanged = ({ event: { previousPlaybackOptions }, playbackOptions }) => (
  JSON.stringify(playbackOptions) !== JSON.stringify(previousPlaybackOptions)
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
        complete: iterationsComplete({ at: timestamp, duration, iterations, started }),
        initialIterations,
        iterations,
        reverse
      })

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

/**
 * Creates a subscribe function.
 * The created function adds an EventSubscription to the subscriptions
 * property of an EventObject.
 *
 * @param {Timeline} timeline
 *
 * @returns {function}
 *
 * @example
 * subscribe(timeline)('timeline.start', () => console.log('timeline.start'))
 */
const subscribe = timeline => (name, callback) => {
  if (validEventName(name)) {
    if (__DEV__ && typeof callback !== 'function') {
      throw new TypeError(`The subscribe functions second argument must be of type function`)
    }

    const token = ++t

    timeline.event.subscriptions.push({ name, callback, token })

    return token
  }
}

/**
 * Is an event name valid?
 *
 * @param {string} name
 *
 * @throws {TypeError} Throws if not valid
 *
 * @returns {true}
 *
 * @example
 * validEventName('timeline.start')
 */
const validEventName = name => {
  if (__DEV__) {
    if (typeof name !== 'string') {
      throw new TypeError(`The subscribe functions first argument must be of type string`)
    }

    if (acceptedEventNames.indexOf(name) === -1) {
      throw new TypeError(`The subscribe functions first argument was not a valid event name`)
    }
  }

  return true
}

/**
 * Creates an unsubscribe function.
 * Created function removes an EventSubscription from the subscriptions
 * property of an EventObject, given the Event token.
 *
 * @param {Timeline} timeline
 *
 * @returns {function}
 *
 * @example
 * unsubscribe(timeline)(token)
 */
const unsubscribe = timeline => token => {
  const matchIndex = timeline.event.subscriptions.reduce((x, subscription, i) => (
    subscription.token === token ? i : x
  ), undefined)

  if (typeof matchIndex !== 'undefined') {
    timeline.event.subscriptions.splice(matchIndex, 1)
    return true
  }

  return false
}

export {
  activeEventNames,
  event,
  eventQueue,
  oldest,
  playbackOptionsChanged,
  positionTimestamps,
  subscribe,
  timeToPosition,
  timeToSamePosition,
  unsubscribe,
  validEventName
}

export default events

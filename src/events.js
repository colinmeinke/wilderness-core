/* globals __DEV__ */

import { currentReverse, iterationsComplete, position } from './timeline'

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
  .reduce((a, x) => a.indexOf(x) === -1 ? a.concat(x) : x, [])

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
 * An array of Events that have occured since last check.
 *
 * @param {Timeline} timeline
 * @param {string[]} eventNames
 *
 * @returns {Event[]}
 *
 * @example
 * eventQueue(timeline, eventNames)
 */
const eventQueue = ({ event: { previousState }, playbackOptions, state }, eventNames) => {
  const queue = []
  const { alternate, duration, initialIterations, iterations, reverse, started } = playbackOptions
  const max = started + (duration * state.iterationsComplete)
  const min = typeof previousState.iterationsComplete !== 'undefined'
    ? started + (duration * previousState.iterationsComplete) + 1
    : 0

  if (eventNames.indexOf('timeline.start') !== -1) {
    const timestamps = timelineStartTimestamps({ alternate, duration, initialIterations, iterations, max, min, reverse, started })
    timestamps.map(timestamp => queue.push({ name: 'timeline.start', at: timestamp }))
  }

  if (eventNames.indexOf('timeline.finish') !== -1) {
    const timestamps = timelineFinishTimestamps({ alternate, duration, initialIterations, iterations, max, min, reverse, started })
    timestamps.map(timestamp => queue.push({ name: 'timeline.finish', at: timestamp }))
  }

  if (eventNames.indexOf('frame') !== -1) {
    queue.push({ name: 'frame', at: max })
  }

  return queue.sort(oldest)
}

/**
 * A sort compare function for Events.
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
 * Add an EventSubscription to the subscriptions property of an EventObject.
 *
 * @param {string} name
 * @param {function} callback
 *
 * @throws {TypeError} Throws if not valid
 *
 * @returns {number}
 *
 * @example
 * subscribe('timeline.start', () => console.log('timeline.start'))
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
 * An array of timestamps for a timeline.start Event.
 *
 * @param {Object} opts
 * @param {boolean} opts.alternate
 * @param {number} opts.duration
 * @param {number} initialIterations
 * @param {number} iterations
 * @param {number} opts.max - The maximum value for a timestamp.
 * @param {number} opts.min - The minimum value for a timestamp.
 * @param {boolean} opts.reverse
 * @param {number} opts.started
 *
 * @returns {number[]}
 *
 * @example
 * timelineFinishTimestamps(opts)
 */
const timelineFinishTimestamps = opts => timelineTimestamps({ ...opts, type: 'finish' })

/**
 * An array of timestamps for a timeline.start Event.
 *
 * @param {Object} opts
 * @param {boolean} opts.alternate
 * @param {number} opts.duration
 * @param {number} initialIterations
 * @param {number} iterations
 * @param {number} opts.max - The maximum value for a timestamp.
 * @param {number} opts.min - The minimum value for a timestamp.
 * @param {boolean} opts.reverse
 * @param {number} opts.started
 *
 * @returns {number[]}
 *
 * @example
 * timelineStartTimestamps(opts)
 */
const timelineStartTimestamps = opts => timelineTimestamps({ ...opts, type: 'start' })

/**
 * An array of timestamps for a timeline Event.
 *
 * @param {Object} opts
 * @param {boolean} opts.alternate
 * @param {number} opts.duration
 * @param {number} initialIterations
 * @param {number} iterations
 * @param {number} opts.max - The maximum value for a timestamp.
 * @param {number} opts.min - The minimum value for a timestamp.
 * @param {boolean} opts.reverse
 * @param {number} opts.started
 * @param {string} opts.type - Either start or finish.
 *
 * @returns {number[]}
 *
 * @example
 * timelineTimestamps(opts)
 */
const timelineTimestamps = ({
  alternate,
  duration,
  initialIterations,
  iterations,
  max,
  min,
  reverse,
  started,
  type
}) => {
  const startedPosition = position(initialIterations, reverse)
  const finishedTime = started + duration * iterations
  const timestamps = []
  const timestampIncrement = alternate ? duration * 2 : duration

  const timeToFirstTimestamp = type === 'start'
    ? timeToFirstStartTimestamp({ alternate, duration, reverse, startedPosition })
    : timeToFirstFinishTimestamp({ alternate, duration, reverse, startedPosition })

  let timestamp = started + timeToFirstTimestamp

  while (
    timestamp <= max &&
    (
      timestamp < finishedTime ||
      (
        timestamp === finishedTime &&
        (type === 'start') === currentReverse({
          alternate,
          complete: iterationsComplete({ at: timestamp, duration, iterations, started }),
          initialIterations,
          iterations,
          reverse
        })
      )
    )
  ) {
    if (timestamp >= min) {
      timestamps.push(timestamp)
    }

    timestamp += timestampIncrement
  }

  return timestamps
}

/**
 * Calculate milliseconds from startedPosition to first timeline.finish event.
 *
 * @param {Object} opts
 * @param {boolean} alternate
 * @param {number} duration
 * @param {boolean} reverse
 * @param {number} startedPosition
 *
 * @returns {number}
 *
 * @example
 * timeToFirstFinishTimestamp(opts)
 */
const timeToFirstFinishTimestamp = ({ alternate, duration, reverse, startedPosition }) => (
  startedPosition === 1 ? 0 : !reverse
    ? duration * (1 - startedPosition)
    : alternate
      ? duration * (1 + startedPosition)
      : duration * startedPosition
)

/**
 * Calculate milliseconds from startedPosition to first timeline.start event.
 *
 * @param {Object} opts
 * @param {boolean} alternate
 * @param {number} duration
 * @param {boolean} reverse
 * @param {number} startedPosition
 *
 * @returns {number}
 *
 * @example
 * timeToFirstStartTimestamp(opts)
 */
const timeToFirstStartTimestamp = ({ alternate, duration, reverse, startedPosition }) => (
  startedPosition === 0 ? 0 : reverse
    ? duration * startedPosition
    : alternate
      ? duration * (2 - startedPosition)
      : duration * (1 - startedPosition)
)

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
 * Remove an EventSubscription from the subscriptions property of an EventObject.
 *
 * @param {number} token
 *
 * @example
 * unsubscribe(token)
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

export { event, eventQueue, timelineFinishTimestamps, timelineStartTimestamps }
export default events

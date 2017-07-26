/* globals describe it expect */

import events, {
  activeEventNames,
  event,
  eventQueue,
  oldest,
  playbackOptionsChanged,
  positionTimestamps,
  subscribe,
  timeToPosition,
  timeToSamePosition,
  unsubscribe
} from '../src/events'

describe('activeEventNames', () => {
  it('should return active event names from a timeline', () => {
    const timeline = { event: { subscriptions: [
      { name: 'timeline.start' },
      { name: 'frame' }
    ] } }

    expect(activeEventNames(timeline)).toEqual([
      'timeline.start',
      'frame'
    ])
  })

  it('should remove duplicate active event names', () => {
    const timeline = { event: { subscriptions: [
      { name: 'timeline.start' },
      { name: 'frame' },
      { name: 'timeline.start' }
    ] } }

    expect(activeEventNames(timeline)).toEqual([
      'timeline.start',
      'frame'
    ])
  })
})

describe('event', () => {
  it('should create an EventObject', () => {
    const e = event({})
    expect(e).toHaveProperty('previousPlaybackOptions')
    expect(e).toHaveProperty('previousState')
    expect(e).toHaveProperty('subscribe')
    expect(e).toHaveProperty('subscriptions')
    expect(e).toHaveProperty('unsubscribe')
    expect(typeof e.previousPlaybackOptions).toBe('object')
    expect(typeof e.previousState).toBe('object')
    expect(typeof e.subscribe).toBe('function')
    expect(Array.isArray(e.subscriptions)).toBe(true)
    expect(typeof e.unsubscribe).toBe('function')
  })
})

describe('eventQueue', () => {
  it('should include a timeline.start event', () => {
    const timeline = {
      event: { previousState: {} },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: { iterationsComplete: 0.5 }
    }

    const eventNames = [ 'timeline.start' ]

    expect(eventQueue(timeline, eventNames)).toEqual([
      { name: 'timeline.start', at: 0 }
    ])
  })

  it('should include multiple timeline.start events', () => {
    const timeline = {
      event: { previousState: {} },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 4,
        reverse: false,
        started: 0
      },
      state: { iterationsComplete: 4 }
    }

    const eventNames = [ 'timeline.start' ]

    expect(eventQueue(timeline, eventNames)).toEqual([
      { name: 'timeline.start', at: 0 },
      { name: 'timeline.start', at: 100 },
      { name: 'timeline.start', at: 200 },
      { name: 'timeline.start', at: 300 }
    ])
  })

  it('should not include events outside of bounds', () => {
    const timeline = {
      event: { previousState: { iterationsComplete: 0.45 } },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: { iterationsComplete: 0.5 }
    }

    const eventNames = [ 'timeline.start' ]

    expect(eventQueue(timeline, eventNames)).toEqual([])
  })

  it('should include a timeline.finish event', () => {
    const timeline = {
      event: { previousState: {} },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: { iterationsComplete: 1 }
    }

    const eventNames = [ 'timeline.finish' ]

    expect(eventQueue(timeline, eventNames)).toEqual([
      { name: 'timeline.finish', at: 100 }
    ])
  })

  it('should include shape.start events', () => {
    const timeline = {
      event: { previousState: {} },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: { iterationsComplete: 1 },
      timelineShapes: [
        { shape: { name: 'SHAPE_1' }, timelinePosition: { start: 0 } },
        { shape: { name: 'SHAPE_2' }, timelinePosition: { start: 0.5 } }
      ]
    }

    const eventNames = [ 'shape.start' ]

    expect(eventQueue(timeline, eventNames)).toEqual([
      { name: 'shape.start', at: 0, options: { shapeName: 'SHAPE_1' } },
      { name: 'shape.start', at: 50, options: { shapeName: 'SHAPE_2' } }
    ])
  })

  it('should include shape.finish events', () => {
    const timeline = {
      event: { previousState: {} },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: { iterationsComplete: 1 },
      timelineShapes: [
        { shape: { name: 'SHAPE_1' }, timelinePosition: { finish: 0.5 } },
        { shape: { name: 'SHAPE_2' }, timelinePosition: { finish: 1 } }
      ]
    }

    const eventNames = [ 'shape.finish' ]

    expect(eventQueue(timeline, eventNames)).toEqual([
      { name: 'shape.finish', at: 50, options: { shapeName: 'SHAPE_1' } },
      { name: 'shape.finish', at: 100, options: { shapeName: 'SHAPE_2' } }
    ])
  })

  it('should include keyframe events', () => {
    const timeline = {
      event: { previousState: {} },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: { iterationsComplete: 1 },
      timelineShapes: [
        {
          shape: {
            name: 'SHAPE_1',
            keyframes: [
              { name: 0, position: 0 },
              { name: 1, position: 1 }
            ]
          },
          timelinePosition: { start: 0, finish: 0.5 }
        },
        {
          shape: {
            name: 'SHAPE_2',
            keyframes: [
              { name: 0, position: 0 },
              { name: 1, position: 1 }
            ]
          },
          timelinePosition: { start: 0.5, finish: 1 }
        }
      ]
    }

    const eventNames = [ 'keyframe' ]

    expect(eventQueue(timeline, eventNames)).toEqual([
      { name: 'keyframe', at: 0, options: { keyframeName: 0, shapeName: 'SHAPE_1' } },
      { name: 'keyframe', at: 50, options: { keyframeName: 1, shapeName: 'SHAPE_1' } },
      { name: 'keyframe', at: 50, options: { keyframeName: 0, shapeName: 'SHAPE_2' } },
      { name: 'keyframe', at: 100, options: { keyframeName: 1, shapeName: 'SHAPE_2' } }
    ])
  })

  it('should include a frame event', () => {
    const timeline = {
      event: { previousState: {} },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: { iterationsComplete: 0.5 }
    }

    const eventNames = [ 'frame' ]

    expect(eventQueue(timeline, eventNames)).toEqual([
      { name: 'frame', at: 50 }
    ])
  })
})

describe('events', () => {
  it('should call a subscription callback', () => {
    let i = 0

    const timeline = {
      event: {
        previousPlaybackOptions: {},
        previousState: {},
        subscriptions: [
          { name: 'timeline.start', callback: () => ++i }
        ]
      },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: {
        started: true,
        finished: false,
        iterationsComplete: 0.5
      }
    }

    events(timeline)

    expect(i).toBe(1)
  })

  it('should call a subscription callback multiple times', () => {
    let i = 0

    const timeline = {
      event: {
        previousPlaybackOptions: {},
        previousState: {},
        subscriptions: [
          { name: 'timeline.start', callback: () => ++i }
        ]
      },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 4,
        reverse: false,
        started: 0
      },
      state: {
        started: true,
        finished: false,
        iterationsComplete: 4
      }
    }

    events(timeline)

    expect(i).toBe(4)
  })

  it('should not call a subscription callback', () => {
    let i = 0

    const timeline = {
      event: {
        previousPlaybackOptions: {
          alternate: false,
          duration: 100,
          initialIterations: 0,
          iterations: 1,
          reverse: false,
          started: 0
        },
        previousState: {
          started: true,
          finished: false,
          iterationsComplete: 3.45
        },
        subscriptions: [
          { name: 'timeline.start', callback: () => ++i }
        ]
      },
      playbackOptions: {
        alternate: false,
        duration: 100,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state: {
        started: true,
        finished: false,
        iterationsComplete: 3.5
      }
    }

    events(timeline)

    expect(i).toBe(0)
  })
})

describe('oldest', () => {
  it('should sort an array of Events to oldest first', () => {
    const queue = [
      { at: 100 },
      { at: 0 },
      { at: 50 },
      { at: 7 }
    ]

    const expectedQueue = [
      { at: 0 },
      { at: 7 },
      { at: 50 },
      { at: 100 }
    ]

    expect(queue.sort(oldest)).toEqual(expectedQueue)
  })
})

describe('playbackOptionsChanged', () => {
  it('should return true when playback options have changed', () => {
    const timeline = {
      event: {
        previousPlaybackOptions: {}
      },
      playbackOptions: {
        started: 100
      }
    }

    expect(playbackOptionsChanged(timeline)).toBe(true)
  })

  it('should return false when playback options have changed', () => {
    const timeline = {
      event: {
        previousPlaybackOptions: {
          started: 100
        }
      },
      playbackOptions: {
        started: 100
      }
    }

    expect(playbackOptionsChanged(timeline)).toBe(false)
  })
})

describe('subscribe', () => {
  it('should create a subscribe function', () => {
    expect(typeof subscribe({ event: { subscriptions: [] } })).toBe('function')
  })

  it('should return unique tokens', () => {
    const timeline = { event: { subscriptions: [] } }
    const eventName = 'timeline.start'
    const callback = () => console.log('hello world')

    const s = subscribe(timeline)

    const token1 = s(eventName, callback)
    const token2 = s(eventName, callback)

    expect(token1).not.toBe(token2)
  })

  it('should add an item to the subsciptions array', () => {
    const timeline = { event: { subscriptions: [] } }
    const eventName = 'timeline.start'
    const callback = () => console.log('hello world')

    const s = subscribe(timeline)

    const token = s(eventName, callback)
    const expectedSubscription = { callback, name: eventName, token }

    expect(timeline.event.subscriptions[ 0 ]).toEqual(expectedSubscription)
  })
})

describe('positionTimestamps', () => {
  it('should calculate timestamps at position 1', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 1,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600 ])
  })

  it('should calculate timestamps at position 1 when multiple iterations', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 1,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600, 700, 800, 900, 1000 ])
  })

  it('should calculate timestamps at position 1 when in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 1,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500 ])
  })

  it('should calculate timestamps at position 1 when multiple iterations in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 1,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500, 600, 700, 800, 900 ])
  })

  it('should calculate timestamps at position 1 when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 1,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600 ])
  })

  it('should calculate timestamps at position 1 when multiple iterations and alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 1,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600, 800, 1000 ])
  })

  it('should calculate timestamps at position 1 when alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 1,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500 ])
  })

  it('should calculate timestamps at position 1 when multiple iterations and alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 1,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500, 700, 900 ])
  })

  it('should calculate timestamps at position 1 when initial position non-zero', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 0.25,
      max: 1000,
      min: 0,
      position: 1,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525 ])
  })

  it('should calculate timestamps at position 1 when multiple iterations and initial position non-zero', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 1,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525, 625, 725, 825 ])
  })

  it('should calculate timestamps at position 1 with multiple alternating iterations and initial position non-zero', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 1,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525, 725 ])
  })

  it('should calculate timestamps at position 1 with multiple alternating iterations started in reverse and initial position non-zero', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 1,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 625, 825 ])
  })

  it('should calculate timestamps at position 1 within bounds', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 4,
      max: 555,
      min: 550,
      position: 1,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([])
  })

  it('should calculate timestamps at position 1 when already past first possible timestamp', () => {
    const opts = {
      alternate: false,
      duration: 1,
      initialIterations: 0,
      iterations: 5,
      max: 1501009625706,
      min: 1501009625703,
      position: 1,
      reverse: false,
      started: 1501009625701
    }

    expect(positionTimestamps(opts)).toEqual([ 1501009625703, 1501009625704, 1501009625705, 1501009625706 ])
  })

  it('should calculate timestamps at position 0', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 0,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500 ])
  })

  it('should calculate timestamps at position 0 when multiple iterations', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 0,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500, 600, 700, 800, 900 ])
  })

  it('should calculate timestamps at position 0 when in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 0,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600 ])
  })

  it('should calculate timestamps at position 0 when multiple iterations in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 0,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600, 700, 800, 900, 1000 ])
  })

  it('should calculate timestamps at position 0 when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 0,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500 ])
  })

  it('should calculate timestamps at position 0 when multiple iterations and alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 0,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500, 700, 900 ])
  })

  it('should calculate timestamps at position 0 when alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 0,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600 ])
  })

  it('should calculate timestamps at position 0 when multiple iterations and alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 0,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600, 800, 1000 ])
  })

  it('should calculate timestamps at position 0 when initial position non-zero', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 0.25,
      max: 1000,
      min: 0,
      position: 0,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([])
  })

  it('should calculate timestamps at position 0 when multiple iterations and initial position non-zero', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 0,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525, 625, 725, 825 ])
  })

  it('should calculate timestamps at position 0 with multiple alternating iterations and initial position non-zero', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 0,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 625, 825 ])
  })

  it('should calculate timestamps at position 0 with multiple alternating iterations started in reverse and initial position non-zero', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 0,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525, 725 ])
  })

  it('should calculate timestamps at position 0 within bounds', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 4,
      max: 555,
      min: 550,
      position: 0,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([])
  })

  it('should calculate timestamps at position 0 when already past first possible timestamp', () => {
    const opts = {
      alternate: false,
      duration: 1,
      initialIterations: 0,
      iterations: 5,
      max: 1501009625706,
      min: 1501009625703,
      position: 0,
      reverse: false,
      started: 1501009625701
    }

    expect(positionTimestamps(opts)).toEqual([ 1501009625703, 1501009625704, 1501009625705 ])
  })

  it('should calculate timestamps at position 0.25', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525 ])
  })

  it('should calculate timestamps at position 0.25 when multiple iterations', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525, 625, 725, 825, 925 ])
  })

  it('should calculate timestamps at position 0.25 when in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 575 ])
  })

  it('should calculate timestamps at position 0.25 when multiple iterations in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 575, 675, 775, 875, 975 ])
  })

  it('should calculate timestamps at position 0.25 when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525 ])
  })

  it('should calculate timestamps at position 0.25 when multiple iterations and alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 525, 675, 725, 875, 925 ])
  })

  it('should calculate timestamps at position 0.25 when alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 575 ])
  })

  it('should calculate timestamps at position 0.25 when multiple iterations and alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 575, 625, 775, 825, 975 ])
  })

  it('should calculate timestamps at position 0.25 when initial position non-zero', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 0.25,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([])
  })

  it('should calculate timestamps at position 0.25 when multiple iterations and initial position non-zero', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 550, 650, 750, 850 ])
  })

  it('should calculate timestamps at position 0.25 with multiple alternating iterations and initial position non-zero', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 600, 650, 800, 850 ])
  })

  it('should calculate timestamps at position 0.25 with multiple alternating iterations started in reverse and initial position non-zero', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      position: 0.25,
      reverse: true,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([ 500, 550, 700, 750, 900 ])
  })

  it('should calculate timestamps at position 0.25 within bounds', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 4,
      max: 555,
      min: 550,
      position: 0.25,
      reverse: false,
      started: 500
    }

    expect(positionTimestamps(opts)).toEqual([])
  })

  it('should calculate timestamps at position 0.25 when already past first possible timestamp', () => {
    const opts = {
      alternate: false,
      duration: 1,
      initialIterations: 0,
      iterations: 5,
      max: 1501009625706,
      min: 1501009625703,
      position: 0.25,
      reverse: false,
      started: 1501009625701
    }

    expect(positionTimestamps(opts)).toEqual([ 1501009625703.25, 1501009625704.25, 1501009625705.25 ])
  })
})

describe('timeToPosition', () => {
  it('should calculate correct time to 0', () => {
    const opts = { duration: 100, to: 0 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(75)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(0)
  })

  it('should calculate correct time to 0 when in reverse', () => {
    const opts = { duration: 100, reverse: true, to: 0 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(75)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(100)
  })

  it('should calculate correct time to 0 when alternating', () => {
    const opts = { alternate: true, duration: 100, to: 0 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(175)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(150)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(125)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(100)
  })

  it('should calculate correct time to 0 when alternating in reverse', () => {
    const opts = { alternate: true, duration: 100, reverse: true, to: 0 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(75)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(100)
  })

  it('should calculate correct time to 1', () => {
    const opts = { duration: 100, to: 1 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(100)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(75)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(0)
  })

  it('should calculate correct time to 1 when in reverse', () => {
    const opts = { duration: 100, reverse: true, to: 1 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(75)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(0)
  })

  it('should calculate correct time to 1 when alternating', () => {
    const opts = { alternate: true, duration: 100, to: 1 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(100)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(75)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(0)
  })

  it('should calculate correct time to 1 when alternating in reverse', () => {
    const opts = { alternate: true, duration: 100, reverse: true, to: 1 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(100)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(125)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(150)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(175)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(0)
  })

  it('should calculate correct time to 0.25', () => {
    const opts = { duration: 100, to: 0.25 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(75)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(25)
  })

  it('should calculate correct time to 0.25 when in reverse', () => {
    const opts = { duration: 100, reverse: true, to: 0.25 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(75)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(75)
  })

  it('should calculate correct time to 0.25 when alternating', () => {
    const opts = { alternate: true, duration: 100, to: 0.25 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(125)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(100)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(75)
  })

  it('should calculate correct time to 0.25 when alternating in reverse', () => {
    const opts = { alternate: true, duration: 100, reverse: true, to: 0.25 }
    expect(timeToPosition({ ...opts, from: 0 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 0.25 })).toBe(0)
    expect(timeToPosition({ ...opts, from: 0.5 })).toBe(25)
    expect(timeToPosition({ ...opts, from: 0.75 })).toBe(50)
    expect(timeToPosition({ ...opts, from: 1 })).toBe(75)
  })
})

describe('timeToSamePosition', () => {
  it('should calculate correct increment for position 0', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 0,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0 in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 0,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0 when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 0,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(200)
  })

  it('should calculate correct increment for position 0 when alternating in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 0,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(200)
  })

  it('should calculate correct increment for position 1', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 1,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 1 in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 1,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 1 when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 1,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(200)
  })

  it('should calculate correct increment for position 1 when alternating in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 1,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(200)
  })

  it('should calculate correct increment for position 0.25', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 0.25,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0.25 in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 0.25,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0.25 when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 0.25,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(150)
  })

  it('should calculate correct increment for position 0.25 when alternating in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 0.25,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(50)
  })

  it('should calculate correct increment for position 0.5', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 0.5,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0.5 in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 0.5,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0.5 when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 0.5,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0.5 when alternating in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 0.5,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0.75', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 0.75,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0.75 in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      position: 0.75,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(100)
  })

  it('should calculate correct increment for position 0.75 when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 0.75,
      reverse: false
    }

    expect(timeToSamePosition(opts)).toBe(50)
  })

  it('should calculate correct increment for position 0.75 when alternating in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      position: 0.75,
      reverse: true
    }

    expect(timeToSamePosition(opts)).toBe(150)
  })
})

describe('unsubscribe', () => {
  it('should create an unsubscribe function', () => {
    expect(typeof unsubscribe({ event: { subscriptions: [] } })).toBe('function')
  })

  it('should remove an item from the subsciptions array', () => {
    const timeline = { event: { subscriptions: [] } }
    const eventName = 'timeline.start'
    const callback = () => console.log('hello world')

    const s = subscribe(timeline)
    const u = unsubscribe(timeline)

    const token = s(eventName, callback)

    u(token)

    expect(timeline.event.subscriptions.length).toBe(0)
  })
})

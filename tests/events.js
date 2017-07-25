/* globals describe it expect */

import events, { event, eventQueue, timelineFinishTimestamps, timelineStartTimestamps } from '../src/events'

describe('event', () => {
  it('should create object a subscribe function that returns unique tokens', () => {
    const timeline = {}
    const eventName = 'timeline.start'
    const callback = () => console.log('hello world')

    timeline.event = event(timeline)

    const token1 = timeline.event.subscribe(eventName, callback)
    const token2 = timeline.event.subscribe(eventName, callback)

    expect(token1).not.toBe(token2)
  })

  it('should create object with working subscribe function', () => {
    const timeline = {}
    const eventName = 'timeline.start'
    const callback = () => console.log('hello world')

    timeline.event = event(timeline)

    const token = timeline.event.subscribe(eventName, callback)
    const expectedSubscription = { callback, name: eventName, token }

    expect(timeline.event.subscriptions[ 0 ]).toEqual(expectedSubscription)
  })

  it('should create object with working unsubscribe function', () => {
    const timeline = {}
    const eventName = 'timeline.start'
    const callback = () => console.log('hello world')

    timeline.event = event(timeline)

    const token = timeline.event.subscribe(eventName, callback)

    timeline.event.unsubscribe(token)

    expect(timeline.event.subscriptions.length).toBe(0)
  })
})

describe('eventQueue', () => {
  it('should include timeline.start event', () => {
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

  it('should not include timeline.start event if not within bounds', () => {
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

  it('should include frame event', () => {
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
  it('should call a subscription callback when there is an event fired', () => {
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

  it('should call a subscription callback multiple times when there an event is fired multiple times', () => {
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

  it('should not call a subscription callback when there are no events fired', () => {
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

describe('timelineFinishTimestamps', () => {
  it('should correctly calculate timestamps with one iteration', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 600 ])
  })

  it('should correctly calculate timestamps with multiple iterations', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 600, 700, 800, 900, 1000 ])
  })

  it('should correctly calculate timestamps with one iteration in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 500 ])
  })

  it('should correctly calculate timestamps with multiple iterations in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 500, 600, 700, 800, 900 ])
  })

  it('should correctly calculate timestamps with one iteration when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 600 ])
  })

  it('should correctly calculate timestamps with multiple iterations when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 600, 800, 1000 ])
  })

  it('should correctly calculate timestamps with one iteration when alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 500 ])
  })

  it('should correctly calculate timestamps with multiple iterations when alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 500, 700, 900 ])
  })

  it('should correctly calculate timestamps when initialIterations not 0', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 0.25,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 525 ])
  })

  it('should correctly calculate timestamps with multiple iterations when initialIterations not 0', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 525, 625, 725, 825 ])
  })

  it('should correctly calculate timestamps with multiple alternating iterations when initialIterations not 0', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 525, 725 ])
  })

  it('should correctly calculate timestamps with multiple alternating iterations when initialIterations not 0 started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 625, 825 ])
  })

  it('should correctly calculate timestamps within bounds', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 4,
      max: 555,
      min: 550,
      reverse: false,
      started: 500
    }

    expect(timelineFinishTimestamps(opts)).toEqual([])
  })

  it('should correctly calculate timestamps when already passed first timeframe', () => {
    const opts = {
      alternate: false,
      duration: 1,
      initialIterations: 0,
      iterations: 5,
      max: 1501009625706,
      min: 1501009625703,
      reverse: false,
      started: 1501009625701
    }

    expect(timelineFinishTimestamps(opts)).toEqual([ 1501009625703, 1501009625704, 1501009625705, 1501009625706 ])
  })
})

describe('timelineStartTimestamps', () => {
  it('should correctly calculate timestamps with one iteration', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 500 ])
  })

  it('should correctly calculate timestamps with multiple iterations', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 500, 600, 700, 800, 900 ])
  })

  it('should correctly calculate timestamps with one iteration in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 600 ])
  })

  it('should correctly calculate timestamps with multiple iterations in reverse', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 600, 700, 800, 900, 1000 ])
  })

  it('should correctly calculate timestamps with one iteration when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 500 ])
  })

  it('should correctly calculate timestamps with multiple iterations when alternating', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 500, 700, 900 ])
  })

  it('should correctly calculate timestamps with one iteration when alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 1,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 600 ])
  })

  it('should correctly calculate timestamps with multiple iterations when alternating started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 0,
      iterations: 5,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 600, 800, 1000 ])
  })

  it('should correctly calculate timestamps when initialIterations not 0', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 0.25,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([])
  })

  it('should correctly calculate timestamps with multiple iterations when initialIterations not 0', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 525, 625, 725, 825 ])
  })

  it('should correctly calculate timestamps with multiple alternating iterations when initialIterations not 0', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      reverse: false,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 625, 825 ])
  })

  it('should correctly calculate timestamps with multiple alternating iterations when initialIterations not 0 started in reverse', () => {
    const opts = {
      alternate: true,
      duration: 100,
      initialIterations: 2.75,
      iterations: 4,
      max: 1000,
      min: 0,
      reverse: true,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 525, 725 ])
  })

  it('should correctly calculate timestamps within bounds', () => {
    const opts = {
      alternate: false,
      duration: 100,
      initialIterations: 0,
      iterations: 4,
      max: 555,
      min: 550,
      reverse: false,
      started: 500
    }

    expect(timelineStartTimestamps(opts)).toEqual([])
  })

  it('should correctly calculate timestamps when already passed first timeframe', () => {
    const opts = {
      alternate: false,
      duration: 1,
      initialIterations: 0,
      iterations: 5,
      max: 1501009625706,
      min: 1501009625703,
      reverse: false,
      started: 1501009625701
    }

    expect(timelineStartTimestamps(opts)).toEqual([ 1501009625703, 1501009625704, 1501009625705 ])
  })
})

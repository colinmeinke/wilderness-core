/* globals describe it expect */

import config from '../src/config'
import shape from '../src/shape'
import timeline, {
  currentReverse,
  pause,
  play,
  position,
  sameDirection,
  updateState
} from '../src/timeline'

describe('timeline', () => {
  it('should throw if not passed a shape', () => {
    expect(() => timeline())
      .toThrow('The timeline function must be passed at least one Shape')
  })

  it('should throw if not passed an object or an array', () => {
    expect(() => timeline('invalidShape'))
      .toThrow('The timeline function must only be passed objects and arrays')
  })

  it('should throw if passed only an options object', () => {
    expect(() => timeline({ duration: 5000 }))
      .toThrow('The timeline function must receive a Shape as the first argument')
  })

  it('should throw if passed an a non-Shape object as any but the last argument', () => {
    expect(() => timeline({ foo: 'bar' }, { duration: 5000 }))
      .toThrow('The timeline function must receive a Shape as the first argument')
  })

  it('should throw if options are not passed as final argument', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { duration: 5000 }, validShape))
      .toThrow('The timeline function must receive options as the final argument')
  })

  it('should throw if passed an array where the first item is not a Shape', () => {
    expect(() => timeline([ 'invalidShape', { queue: -200 } ]))
      .toThrow('When an array is passed to the timeline function the first item must be a Shape')
  })

  it('should throw if passed an array where the second item is not an object', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline([ validShape, 'invalidOptions' ]))
      .toThrow('When an array is passed to the timeline function the second item must be an object')
  })

  it('should throw if passed alternate option that is not a boolean', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { alternate: 'invalid' }))
      .toThrow('The timeline function alternate option must be true or false')
  })

  it('should throw if passed duration option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { duration: -50 }))
      .toThrow('The timeline function duration option must be a positive number or zero')
  })

  it('should throw if passed initialIterations option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { initialIterations: -50 }))
      .toThrow('The timeline function initialIterations option must be a positive number or zero')
  })

  it('should throw if passed iterations option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { iterations: -50 }))
      .toThrow('The timeline function iterations option must be a positive number or zero')
  })

  it('should throw if passed reverse option that is not a boolean', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { reverse: 'invalid' }))
      .toThrow('The timeline function reverse option must be true or false')
  })

  it('should throw if passed started option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { started: -50 }))
      .toThrow('The timeline function started option must be a positive number or zero')
  })

  it('should throw if passed an invalid shape name option', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline([ validShape, { name: [] } ]))
      .toThrow('The name prop must be of type string or number')
  })

  it('should throw if passed an array shape queue option', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline([ validShape, { queue: [] } ]))
      .toThrow('The queue prop must be of type number, string or object')
  })

  it('should throw if passed an invalid shape queue.at option', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline([ validShape, { queue: { at: [] } } ]))
      .toThrow('The queue.at prop must be of type string or number')
  })

  it('should throw if passed an invalid shape queue.after option', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline([ validShape, { queue: { after: [] } } ]))
      .toThrow('The queue.after prop must be of type string or number')
  })

  it('should throw if passed an invalid shape queue.offset option', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline([ validShape, { queue: { offset: 'invalid' } } ]))
      .toThrow('The queue.offset prop must be of type number')
  })

  it('should not throw if passed a valid Shape and options', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    expect(() => {
      timeline([ validShape, { queue: 200 } ], {
        alternate: true,
        duration: 5000,
        initialIterations: 0.5,
        iterations: 3,
        reverse: false,
        started: 0
      })
    }).not.toThrow()
  })

  it('should return an object with the correct props', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(validShape)
    expect(animation).toHaveProperty('event')
    expect(animation).toHaveProperty('middleware')
    expect(animation).toHaveProperty('playbackOptions')
    expect(animation).toHaveProperty('state')
    expect(animation).toHaveProperty('timelineShapes')
    expect(animation.event).toHaveProperty('subscribe')
    expect(animation.event).toHaveProperty('unsubscribe')
  })

  it('should return default playback options', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const { playbackOptions: {
      alternate,
      duration,
      initialIterations,
      iterations,
      reverse,
      started
    } } = timeline(validShape)

    expect(alternate).toBe(config.defaults.timeline.alternate)
    expect(duration).toBe(0)
    expect(initialIterations).toBe(config.defaults.timeline.initialIterations)
    expect(iterations).toBe(config.defaults.timeline.iterations)
    expect(reverse).toBe(config.defaults.timeline.reverse)
    expect(started).not.toBeDefined()
  })

  it('should calculate correct playback duration', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { playbackOptions: { duration } } = timeline(
      shape1,
      [ shape2, { queue: -200 } ]
    )

    expect(duration).toBe(650)
  })

  it('should calculate correct keyframe positions', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { timelineShapes } = timeline(
      shape1,
      [ shape2, { queue: -200 } ]
    )

    expect(timelineShapes[ 0 ].timelinePosition.start).toBe(0 / 650)
    expect(timelineShapes[ 0 ].timelinePosition.end).toBe(500 / 650)
    expect(timelineShapes[ 1 ].timelinePosition.start).toBe(300 / 650)
    expect(timelineShapes[ 1 ].timelinePosition.end).toBe(650 / 650)
  })

  it('should throw when Shape queued after unknown Shape or Keyframe', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    expect(() => {
      timeline(
        shape1,
        [ shape2, { queue: { after: 'foo' } } ]
      )
    }).toThrow(`No Shape or Keyframe matching name 'foo'`)
  })

  it('should throw when Shape queued at unknown Shape or Keyframe', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    expect(() => {
      timeline(
        shape1,
        [ shape2, { queue: { at: 'foo' } } ]
      )
    }).toThrow(`No Shape or Keyframe matching name 'foo'`)
  })

  it('should correctly queue Shape after named (string) Shape', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const shape3 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { timelineShapes } = timeline(
      [ shape1, { name: 'foo' } ],
      shape2,
      [ shape3, { queue: { after: 'foo', offset: -350 } } ]
    )

    expect(timelineShapes[ 2 ].timelinePosition.start).toBe(150 / 850)
    expect(timelineShapes[ 2 ].timelinePosition.end).toBe(500 / 850)
  })

  it('should correctly queue Shape at named (string) Shape', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const shape3 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { timelineShapes } = timeline(
      [ shape1, { name: 'foo' } ],
      shape2,
      [ shape3, { queue: { at: 'foo', offset: -350 } } ]
    )

    expect(timelineShapes[ 2 ].timelinePosition.start).toBe(0 / 1200)
    expect(timelineShapes[ 2 ].timelinePosition.end).toBe(350 / 1200)
  })

  it('should correctly queue Shape after named (index) Shape', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const shape3 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { timelineShapes } = timeline(
      shape1,
      shape2,
      [ shape3, { queue: { after: 0, offset: -350 } } ]
    )

    expect(timelineShapes[ 2 ].timelinePosition.start).toBe(150 / 850)
    expect(timelineShapes[ 2 ].timelinePosition.end).toBe(500 / 850)
  })

  it('should correctly queue Shape at named (index) Shape', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const shape3 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { timelineShapes } = timeline(
      shape1,
      shape2,
      [ shape3, { queue: { at: 0, offset: -350 } } ]
    )

    expect(timelineShapes[ 2 ].timelinePosition.start).toBe(0 / 1200)
    expect(timelineShapes[ 2 ].timelinePosition.end).toBe(350 / 1200)
  })

  it('should correctly queue Shape after named Keyframe', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 250, name: 'foo' },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { timelineShapes } = timeline(
      shape1,
      [ shape2, { queue: 'foo' } ]
    )

    expect(timelineShapes[ 1 ].timelinePosition.start).toBe(250 / 750)
    expect(timelineShapes[ 1 ].timelinePosition.end).toBe(600 / 750)
  })

  it('should prioritise queing named Shape over Keyframe', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 250, name: 'foo' },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const shape3 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { timelineShapes } = timeline(
      [ shape1, { name: 'foo' } ],
      shape2,
      [ shape3, { queue: { after: 'foo', offset: -350 } } ]
    )

    expect(timelineShapes[ 0 ].timelinePosition.start).toBe(0 / 1100)
    expect(timelineShapes[ 0 ].timelinePosition.end).toBe(750 / 1100)
    expect(timelineShapes[ 1 ].timelinePosition.start).toBe(750 / 1100)
    expect(timelineShapes[ 1 ].timelinePosition.end).toBe(1100 / 1100)
    expect(timelineShapes[ 2 ].timelinePosition.start).toBe(400 / 1100)
    expect(timelineShapes[ 2 ].timelinePosition.end).toBe(750 / 1100)
  })

  it('should correctly queue Shape if passed queue object with only offset prop', () => {
    const shape1 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 500 }
    )

    const shape2 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const shape3 = shape(
      { type: 'rect', width: 50, height: 50, x: 100, y: 100 },
      { type: 'rect', width: 50, height: 50, x: 100, y: 100, duration: 350 }
    )

    const { timelineShapes } = timeline(
      shape1,
      shape2,
      [ shape3, { queue: { offset: -350 } } ]
    )

    expect(timelineShapes[ 2 ].timelinePosition.start).toBe(500 / 850)
    expect(timelineShapes[ 2 ].timelinePosition.end).toBe(850 / 850)
  })

  it('should throw if a Shape is already associated with a timeline', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    timeline(validShape)

    expect(() => timeline(validShape))
      .toThrow('A Shape can only be added to one timeline')
  })

  it('should return default middleware', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(validShape)
    expect(animation.middleware).toBe(config.defaults.timeline.middleware)
  })

  it('should throw if a middleware is not an array', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    expect(() => timeline(validShape, { middleware: 'invalid' }))
      .toThrow('The timeline function middleware option must be of type array')
  })

  it('should throw if a middleware is not named', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    expect(() => timeline(validShape, { middleware: [
      { input: () => ({}), output: () => ({}) }
    ] }))
      .toThrow('A middleware must have a name prop')
  })

  it('should throw if a middleware does not have an input method', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    expect(() => timeline(validShape, { middleware: [
      { name: 'color', input: 'invalid', output: () => ({}) }
    ] }))
      .toThrow('The color middleware must have an input method')
  })

  it('should throw if a middleware does not have an input method', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    expect(() => timeline(validShape, { middleware: [
      { name: 'color', input: () => ({}), output: 'invalid' }
    ] }))
      .toThrow('The color middleware must have an output method')
  })

  it('should have a started state of false when not started', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const { state } = timeline([ validShape, { queue: 200 } ])
    expect(state.started).toBe(false)
  })

  it('should have a started state of true when started', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const { state } = timeline([ validShape, { queue: 200 } ], { started: 0 })
    expect(state.started).toBe(true)
  })

  it('should have a finished state of false when not finished', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const { state } = timeline([ validShape, { queue: 200 } ])
    expect(state.finished).toBe(false)
  })

  it('should have a finished state of true when finished', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const { state } = timeline([ validShape, { queue: 200 } ], { iterations: 0 })
    expect(state.finished).toBe(true)
  })
})

describe('sameDirection', () => {
  it('should return true when completed zero iterations', () => {
    expect(sameDirection(true, 0)).toBe(true)
  })

  it('should return true during first iteration', () => {
    expect(sameDirection(true, 0.35)).toBe(true)
  })

  it('should return true when completed first iteration', () => {
    expect(sameDirection(true, 1)).toBe(true)
  })

  it('should return false during second iteration', () => {
    expect(sameDirection(true, 1.1)).toBe(false)
  })

  it('should return false when completed second iteration', () => {
    expect(sameDirection(true, 2)).toBe(false)
  })

  it('should return true during third iteration', () => {
    expect(sameDirection(true, 2.8)).toBe(true)
  })

  it('should return true when completed third iteration', () => {
    expect(sameDirection(true, 3)).toBe(true)
  })

  it('should return true when not alternating', () => {
    expect(sameDirection(false, 1.1)).toBe(true)
  })
})

describe('currentReverse', () => {
  it('should calculate correct reverse when not started', () => {
    expect(currentReverse({
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: false,
      started: 0,
      complete: 0
    })).toBe(false)
  })

  it('should calculate correct reverse when not started in reverse', () => {
    expect(currentReverse({
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: true,
      started: 0,
      complete: 0
    })).toBe(true)
  })

  it('should calculate correct reverse when complete', () => {
    expect(currentReverse({
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: false,
      started: 0,
      complete: 1
    })).toBe(false)
  })

  it('should calculate correct reverse when complete in reverse', () => {
    expect(currentReverse({
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: true,
      started: 0,
      complete: 1
    })).toBe(true)
  })
})

describe('play', () => {
  it('should throw when not passed a timeline', () => {
    expect(() => { play('invalid', { duration: 5000 }) })
      .toThrow(`The updatePlaybackOptions function must be passed a Timeline`)
  })

  it('should throw if playback options are invalid', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => { play(timeline(square), { duration: 'invalid' }) }).toThrow()
  })

  it('should set a started playback option', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(square)
    play(animation, {}, 500)
    expect(animation.playbackOptions.started).toBe(500)
  })

  it('should not overwrite existing playback options', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 3000,
      initialIterations: 2,
      iterations: 10,
      reverse: true
    })

    play(animation, {}, 500)

    expect(animation.playbackOptions.alternate).toBe(true)
    expect(animation.playbackOptions.duration).toBe(3000)
    expect(animation.playbackOptions.initialIterations).toBe(2)
    expect(animation.playbackOptions.iterations).toBe(10)
    expect(animation.playbackOptions.reverse).toBe(true)
  })

  it('should update initialIterations and iterations if already started', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      duration: 1000,
      initialIterations: 3,
      iterations: 10,
      started: 0
    })

    play(animation, {}, 4000)

    expect(animation.playbackOptions.initialIterations).toBe(7)
    expect(animation.playbackOptions.iterations).toBe(6)
    expect(animation.playbackOptions.reverse).toBe(false)
  })

  it('should not exceed max iterations', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      duration: 1000,
      initialIterations: 3,
      iterations: 10,
      started: 0
    })

    play(animation, {}, 100000)

    expect(animation.playbackOptions.initialIterations).toBe(13)
    expect(animation.playbackOptions.iterations).toBe(0)
  })

  it('should update reverse playback option if alternating', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 2,
      reverse: false,
      started: 0
    })

    play(animation, {}, 1000)

    expect(animation.playbackOptions.initialIterations).toBe(1)
    expect(animation.playbackOptions.iterations).toBe(1)
    expect(animation.playbackOptions.reverse).toBe(false)
  })

  it('should updated playback options correctly when initialIterations', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 2,
      reverse: false,
      started: 0
    })

    play(animation, { initialIterations: 0 }, 2000)

    expect(animation.playbackOptions.initialIterations).toBe(0)
    expect(animation.playbackOptions.iterations).toBe(2)
    expect(animation.playbackOptions.reverse).toBe(false)
  })

  it('should update playback options correctly when initialIterations less than previous initialIterations', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0.25,
      iterations: 2.75,
      reverse: false,
      started: 0
    })

    play(animation, {}, 1000)

    expect(animation.playbackOptions.initialIterations).toBe(1.25)
    expect(animation.playbackOptions.iterations).toBe(1.75)
    expect(animation.playbackOptions.reverse).toBe(true)

    play(animation, { initialIterations: 0.125 }, 2000)

    expect(animation.playbackOptions.initialIterations).toBe(0.125)
    expect(animation.playbackOptions.iterations).toBe(2.875)
    expect(animation.playbackOptions.reverse).toBe(false)
  })

  it('should update playback options correctly when initialIterations and reverse changed', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 10,
      reverse: false,
      started: 0
    })

    play(animation, { initialIterations: 0, reverse: true }, 2000)

    expect(animation.playbackOptions.initialIterations).toBe(0)
    expect(animation.playbackOptions.iterations).toBe(10)
    expect(animation.playbackOptions.reverse).toBe(true)
  })

  it('should update playback options correctly when iterations and reverse changed', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 10,
      reverse: false,
      started: 0
    })

    play(animation, { iterations: 15, reverse: true }, 2250)

    expect(animation.playbackOptions.initialIterations).toBe(7.75)
    expect(animation.playbackOptions.iterations).toBe(15)
    expect(animation.playbackOptions.reverse).toBe(true)
  })

  it('should update playback options correctly when iterations and reverse changed (but reverse same as it would have been)', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 10,
      reverse: false,
      started: 0
    })

    play(animation, { iterations: 15, reverse: false }, 2250)

    expect(animation.playbackOptions.initialIterations).toBe(2.25)
    expect(animation.playbackOptions.iterations).toBe(15)
    expect(animation.playbackOptions.reverse).toBe(false)
  })

  it('should not allow iterations playback option to be less than zero', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: 3,
      reverse: false,
      started: 0
    })

    play(animation, { initialIterations: 51 }, 5000)

    expect(animation.playbackOptions.initialIterations).toBe(51)
    expect(animation.playbackOptions.iterations).toBe(0)
    expect(animation.playbackOptions.reverse).toBe(false)
  })

  it('should reverse inifinite iterations correctly', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: false,
      duration: 1000,
      initialIterations: 0,
      iterations: Infinity,
      reverse: false,
      started: 0
    })

    play(animation, { reverse: true }, 250)

    expect(animation.playbackOptions.initialIterations).toBe(0.75)
    expect(animation.playbackOptions.iterations).toBe(Infinity)
    expect(animation.playbackOptions.reverse).toBe(true)
  })

  it('should reverse inifinite iterations correctly when in reverse', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0,
      iterations: Infinity,
      reverse: false,
      started: 0
    })

    play(animation, { reverse: true }, 1200)

    expect(animation.playbackOptions.initialIterations).toBeCloseTo(0.2)
    expect(animation.playbackOptions.iterations).toBe(Infinity)
    expect(animation.playbackOptions.reverse).toBe(true)
  })

  it('should calculate correct playback options if not started', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0.2,
      iterations: 9.8,
      reverse: false
    })

    play(animation, { reverse: true }, 2250)

    expect(animation.playbackOptions.initialIterations).toBe(9.8)
    expect(animation.playbackOptions.iterations).toBe(0.2)
    expect(animation.playbackOptions.reverse).toBe(true)
  })

  it('should calculate calculate correct playback options if not started and iterations are infinite', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: true,
      duration: 1000,
      initialIterations: 0.2,
      iterations: Infinity,
      reverse: false
    })

    play(animation, { reverse: true }, 9000)

    expect(animation.playbackOptions.initialIterations).toBe(0.8)
    expect(animation.playbackOptions.iterations).toBe(Infinity)
    expect(animation.playbackOptions.reverse).toBe(true)
  })

  it('should not replay if finished', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const animation = timeline(square, {
      alternate: false,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: true,
      started: 0
    })

    play(animation, { reverse: true }, 2000)

    expect(animation.playbackOptions.initialIterations).toBe(1)
    expect(animation.playbackOptions.iterations).toBe(0)
    expect(animation.playbackOptions.reverse).toBe(true)
  })

  it('should set the started timeline state to true', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(square)
    play(animation, {}, 0)
    expect(animation.state.started).toBe(true)
  })

  it('should set the finished timeline state to false when not finished', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(square, { duration: 1000, started: 0 })
    play(animation, {}, 500)
    expect(animation.state.finished).toBe(false)
  })

  it('should set the finished timeline state to true when finished', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(square, { duration: 1000, started: 0 })
    play(animation, {}, 1500)
    expect(animation.state.finished).toBe(true)
  })
})

describe('pause', () => {
  it('should throw when not passed a timeline', () => {
    expect(() => { pause('invalid', { duration: 5000 }) })
      .toThrow(`The updatePlaybackOptions function must be passed a Timeline`)
  })

  it('should throw if playback options are invalid', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => { pause(timeline(square), { duration: 'invalid' }) }).toThrow()
  })

  it('should remove the started playback option', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(square, { started: 0, duration: 1000 })
    pause(animation, {}, 500)
    expect(animation.playbackOptions.started).toBeUndefined()
  })

  it('should update initialIterations and iterations if already started', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(square, { started: 0, duration: 1000 })
    pause(animation, {}, 750)
    expect(animation.playbackOptions.initialIterations).toBe(0.75)
    expect(animation.playbackOptions.iterations).toBe(0.25)
  })

  it('should set the started timeline state to false', () => {
    const square = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    const animation = timeline(square)
    pause(animation, {}, 500)
    expect(animation.state.started).toBe(false)
  })
})

describe('position', () => {
  it('should calculate the correct position when not in reverse', () => {
    expect(position(0.5, false)).toBe(0.5)
  })

  it('should calculate the correct position when in reverse', () => {
    expect(position(4.75, true)).toBe(0.25)
  })
})

describe('updateState', () => {
  it('should calculate the correct position if finished', () => {
    const state = {}

    updateState({
      playbackOptions: {
        alternate: false,
        duration: 1000,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state
    }, 1001)

    expect(state.position).toBeCloseTo(1)
  })

  it('should calculate correct position if not started', () => {
    const state = {}

    updateState({
      playbackOptions: {
        alternate: false,
        duration: 1000,
        initialIterations: 1.8,
        iterations: 1,
        reverse: false
      },
      state
    }, 1000)

    expect(state.position).toBeCloseTo(0.8)
  })

  it('should calculate correct position if not started and in reverse', () => {
    const state = {}

    updateState({
      playbackOptions: {
        alternate: false,
        duration: 1000,
        initialIterations: 1.8,
        iterations: 1,
        reverse: true
      },
      state
    }, 1000)

    expect(state.position).toBeCloseTo(0.2)
  })

  it('should calculate correct position if not started and alternating', () => {
    const state = {}

    updateState({
      playbackOptions: {
        alternate: true,
        duration: 1000,
        initialIterations: 1.8,
        iterations: 1,
        reverse: false
      },
      state
    }, 1000)

    expect(state.position).toBeCloseTo(0.8)
  })

  it('should calculate correct position if not started and alternating in reverse', () => {
    const state = {}

    updateState({
      playbackOptions: {
        alternate: true,
        duration: 1000,
        initialIterations: 1.8,
        iterations: 1,
        reverse: true
      },
      state
    }, 1000)

    expect(state.position).toBeCloseTo(0.2)
  })

  it('should calculate the correct position during first iteration', () => {
    const state = {}

    updateState({
      playbackOptions: {
        alternate: false,
        duration: 1000,
        initialIterations: 0,
        iterations: 1,
        reverse: false,
        started: 0
      },
      state
    }, 600)

    expect(state.position).toBeCloseTo(0.6)
  })

  it('should calculate the correct position after multiple iterations', () => {
    const state = {}

    updateState({
      playbackOptions: {
        alternate: false,
        duration: 1000,
        initialIterations: 0,
        iterations: 5,
        reverse: false,
        started: 0
      },
      state
    }, 2600)

    expect(state.position).toBeCloseTo(0.6)
  })

  it('should calculate the correct position with complex options', () => {
    const state = {}

    const t = {
      playbackOptions: {
        alternate: true,
        duration: 1000,
        initialIterations: 1.75,
        iterations: 7,
        reverse: true,
        started: 250
      },
      state
    }

    updateState(t, 2500)

    expect(state.position).toBeCloseTo(0)

    updateState(t, 2750)

    expect(state.position).toBeCloseTo(0.25)
  })

  it('should calculate the correct position with inifine iterations', () => {
    const state = {}

    updateState({
      playbackOptions: {
        alternate: true,
        duration: 1000,
        initialIterations: 0.75,
        iterations: Infinity,
        reverse: true,
        started: 0
      },
      state
    }, 0)

    expect(state.position).toBeCloseTo(0.25)
  })

  it('should set finished state to false when not finished', () => {
    const state = {}

    const t = {
      playbackOptions: {
        alternate: true,
        duration: 1000,
        initialIterations: 1.8,
        iterations: 1,
        reverse: true,
        started: 0
      },
      state
    }

    updateState(t, 999)

    expect(state.finished).toBe(false)
  })

  it('should set finished state to true when finished', () => {
    const state = {}

    const t = {
      playbackOptions: {
        alternate: true,
        duration: 1000,
        initialIterations: 1.8,
        iterations: 1,
        reverse: true,
        started: 0
      },
      state
    }

    updateState(t, 1000)

    expect(state.finished).toBe(true)
  })
})

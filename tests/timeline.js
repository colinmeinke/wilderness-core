/* globals describe it expect */

import config from '../src/config'
import shape from '../src/shape'
import timeline from '../src/timeline'

describe('shape', () => {
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

  it('should throw if passed delay option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { delay: -50 }))
      .toThrow('The timeline function delay option must be a positive number or zero')
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

  it('should not throw if passed a valid Shape and options', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    expect(() => {
      timeline([ validShape, { queue: 200 } ], {
        alternate: true,
        delay: 200,
        duration: 5000,
        initialIterations: 0.5,
        iterations: 3,
        reverse: false,
        started: 0
      })
    }).not.toThrow()
  })

  it('should return default playback options', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    const { playbackOptions: {
      alternate,
      delay,
      duration,
      initialIterations,
      iterations,
      reverse,
      started
    } } = timeline(validShape)

    expect(alternate).toBe(config.defaults.timeline.alternate)
    expect(delay).toBe(config.defaults.timeline.delay)
    expect(duration).toBe(1000)
    expect(initialIterations).toBe(config.defaults.timeline.initialIterations)
    expect(iterations).toBe(config.defaults.timeline.iterations)
    expect(reverse).toBe(config.defaults.timeline.reverse)
    expect(started).not.toBeDefined()
  })
})

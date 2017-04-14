/* globals describe it expect */

import shape from '../src/shape'
import timeline from '../src/timeline'

describe('shape', () => {
  it('should throw if not passed a shape', () => {
    expect(() => timeline())
      .toThrow('The timeline function must be passed at least one Shape')
  })

  it('should throw if not passed an object or an array as the first argument', () => {
    expect(() => timeline('invalidShape')).toThrow()
  })

  it('should throw if passed only an options object', () => {
    expect(() => timeline({ duration: 5000 })).toThrow()
  })

  it('should throw if passed an a non-Shape object as any but the last argument', () => {
    expect(() => timeline({ foo: 'bar' }, { duration: 5000 })).toThrow()
  })

  it('should throw if passed an array where the first item is not a Shape', () => {
    expect(() => timeline([ 'invalidShape', { queue: -200 } ])).toThrow()
  })

  it('should throw if passed an array where the second item is not an object', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline([ validShape, 'invalidOptions' ])).toThrow()
  })

  it('should throw if passed alternate option that is not a boolean', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { alternate: 'invalid' })).toThrow()
  })

  it('should throw if passed delay option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { delay: -50 })).toThrow()
  })

  it('should throw if passed duration option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { duration: -50 })).toThrow()
  })

  it('should throw if passed initialIterations option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { initialIterations: -50 })).toThrow()
  })

  it('should throw if passed iterations option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { iterations: -50 })).toThrow()
  })

  it('should throw if passed reverse option that is not a boolean', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { reverse: 'invalid' })).toThrow()
  })

  it('should throw if passed started option that is not a positive number', () => {
    const validShape = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })
    expect(() => timeline(validShape, { started: -50 })).toThrow()
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
})

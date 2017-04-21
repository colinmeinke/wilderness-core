/* globals describe it expect */

import frame, { position } from '../src/frame'
import shape from '../src/shape'
import timeline from '../src/timeline'

describe('position', () => {
  it('should calculate correct position if not started', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 1.8,
      iterations: 1,
      reverse: false
    }, 1000)).toBeCloseTo(0.8)
  })

  it('should calculate correct position if not started and in reverse', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 1.8,
      iterations: 1,
      reverse: true
    }, 1000)).toBeCloseTo(0.2)
  })

  it('should calculate correct position if not started and alternating', () => {
    expect(position({
      alternate: true,
      delay: 0,
      duration: 1000,
      initialIterations: 1.8,
      iterations: 1,
      reverse: false
    }, 1000)).toBeCloseTo(0.2)
  })

  it('should calculate correct position if not started and alternating in reverse', () => {
    expect(position({
      alternate: true,
      delay: 0,
      duration: 1000,
      initialIterations: 1.8,
      iterations: 1,
      reverse: true
    }, 1000)).toBeCloseTo(0.8)
  })

  it('should calculate the correct position during first iteration', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: false,
      started: 0,
    }, 600)).toBeCloseTo(0.6)
  })

  it('should calculate the correct position after multiple iterations', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 0,
      iterations: 5,
      reverse: false,
      started: 0,
    }, 2600)).toBeCloseTo(0.6)
  })

  it('should calculate the correct position with delay', () => {
    expect(position({
      alternate: false,
      delay: 500,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: false,
      started: 0,
    }, 750)).toBeCloseTo(0.25)
  })

  it('should calculate the correct position with complex options', () => {
    expect(position({
      alternate: true,
      delay: 500,
      duration: 1000,
      initialIterations: 1.75,
      iterations: 7,
      reverse: true,
      started: 250,
    }, 3000)).toBeCloseTo(1)
  })
})

describe('frame', () => {
  it('should throw if not passed a timeline', () => {
    expect(() => frame())
      .toThrow(`The frame function's first argument must be a Timeline`)
  })

  it('should throw if passed an invalid at prop', () => {
    const s = shape({ type: 'rect', width: 50, height: 50, x: 100, y: 100 })

    expect(() => frame(timeline(s), 'invalid'))
      .toThrow(`The frame function's second argument must be of type number`)
  })
})

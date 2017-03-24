/* globals describe it expect */

import { valid } from '../src/plain-shape-object'

describe('valid', () => {
  it('should throw when passed a non-object', () => {
    expect(() => valid(5)).toThrow()
  })

  it('should throw when no type property', () => {
    const plainShapeObject = { foo: 'bar' }
    expect(() => valid(plainShapeObject)).toThrow()
  })

  it('should throw when a circle has no cx property', () => {
    const plainShapeObject = { type: 'circle', cy: 50, r: 10 }
    expect(() => valid(plainShapeObject)).toThrow()
  })

  it('should throw when a circles cx property is not a number', () => {
    const plainShapeObject = {
      type: 'circle',
      cx: 'potato',
      cy: 50,
      r: 10
    }

    expect(() => valid(plainShapeObject)).toThrow()
  })
})

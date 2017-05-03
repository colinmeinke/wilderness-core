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

  it('should throw when a child shape is invalid', () => {
    const plainShapeObject = {
      type: 'g',
      shapes: [ {}, {} ]
    }

    expect(() => valid(plainShapeObject)).toThrow()
  })

  it('should throw when delay property is invalid', () => {
    const plainShapeObject = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      delay: 'potato'
    }

    expect(() => valid(plainShapeObject)).toThrow()
  })

  it('should throw when duration property is invalid', () => {
    const plainShapeObject = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      duration: 'potato'
    }

    expect(() => valid(plainShapeObject)).toThrow()
  })

  it('should throw when easing property is invalid', () => {
    const plainShapeObject = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      easing: []
    }

    expect(() => valid(plainShapeObject)).toThrow()
  })

  it('should throw when name property is invalid', () => {
    const plainShapeObject = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      name: () => ({})
    }

    expect(() => valid(plainShapeObject)).toThrow()
  })

  it('should throw when transforms property is invalid', () => {
    const plainShapeObject = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: 'potato'
    }

    expect(() => valid(plainShapeObject)).toThrow()
  })
})

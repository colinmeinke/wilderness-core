/* globals describe it expect */

import plainShapeObject, { valid } from '../src/plain-shape-object'
import shape from '../src/shape'
import timeline from '../src/timeline'

describe('plainShapeObject', () => {
  it('should throw when not passed a shape', () => {
    expect(() => plainShapeObject('invalid'))
      .toThrow(`The plainShapeObject function's first argument must be a Shape`)
  })

  it('should create the correct plainShapeObject with a basic shape not on a timeline', () => {
    const s = shape(
      { type: 'rect', x: 0, y: 0, width: 100, height: 100, fill: 'red' },
      { type: 'path', d: 'm0,0l10,10' }
    )

    expect(plainShapeObject(s)).toEqual({
      type: 'path',
      d: 'M0,0H100V100H0Z',
      fill: 'red'
    })
  })

  it('should create the correct plainShapeObject with a group shape not on a timeline', () => {
    const s = shape({
      type: 'g',
      fill: 'red',
      shapes: [
        { type: 'path', d: 'm0,0h100', stroke: 'yellow' },
        { type: 'path', d: 'm50,25l40,-15', stroke: 'green', 'stroke-width': 2 }
      ]
    })

    expect(plainShapeObject(s)).toEqual({
      type: 'g',
      shapes: [
        {
          type: 'path',
          d: 'M0,0H100',
          stroke: 'yellow'
        },
        {
          type: 'path',
          d: 'M50,25L90,10',
          stroke: 'green',
          'stroke-width': 2
        }
      ],
      fill: 'red'
    })
  })

  it('should create the correct plainShapeObject with a basic shape during playback', () => {
    const square = shape(
      { type: 'rect', x: 0, y: 0, width: 100, height: 100, fill: 'red' },
      { type: 'rect', x: 100, y: 100, width: 200, height: 200, fill: 'red' }
    )

    timeline(square, { started: 0, duration: 200 })

    expect(plainShapeObject(square, 100)).toEqual({
      type: 'path',
      d: 'M50,50H200V200H50Z',
      fill: 'rgba(255,0,0,1)'
    })
  })

  it('should create the correct plainShapeObject with a group shape during playback', () => {
    const shape1 = shape(
      { type: 'rect', x: 0, y: 0, width: 100, height: 100 },
      { type: 'rect', x: 100, y: 100, width: 200, height: 200 }
    )

    const shape2 = shape(
      {
        type: 'g',
        shapes: [
          { type: 'rect', x: 0, y: 0, width: 100, height: 100 },
          { type: 'path', d: 'M0,0l100,100' }
        ]
      },
      {
        type: 'g',
        shapes: [
          { type: 'rect', x: 100, y: 100, width: 200, height: 200 },
          { type: 'path', d: 'M0,0l-100,100' }
        ]
      }
    )

    timeline(shape1, shape2, { started: 0, duration: 1000 })

    expect(plainShapeObject(shape1, 750)).toEqual({
      type: 'path',
      d: 'M100,100H300V300H100Z'
    })

    expect(plainShapeObject(shape2, 750)).toEqual({
      type: 'g',
      shapes: [
        { type: 'path', d: 'M50,50H200V200H50Z' },
        { type: 'path', d: 'M0,0V100' }
      ]
    })
  })
})

describe('valid', () => {
  it('should throw when passed a non-object', () => {
    expect(() => valid(5)).toThrow()
  })

  it('should throw when no type property', () => {
    const s = { foo: 'bar' }
    expect(() => valid(s)).toThrow()
  })

  it('should throw when a circle has no cx property', () => {
    const s = { type: 'circle', cy: 50, r: 10 }
    expect(() => valid(s)).toThrow()
  })

  it('should throw when a circles cx property is not a number', () => {
    const s = {
      type: 'circle',
      cx: 'potato',
      cy: 50,
      r: 10
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when a child shape is invalid', () => {
    const s = {
      type: 'g',
      shapes: [ {}, {} ]
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when delay property is invalid', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      delay: 'potato'
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when duration property is invalid', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      duration: 'potato'
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when easing property is invalid', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      easing: []
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when name property is invalid', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      name: () => ({})
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when transforms property is invalid', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: 'potato'
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when transform does not exist', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: [[ 'potato' ]]
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when moveIndex transform does not have correct arguments', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: [[ 'moveIndex', 'potato' ]]
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when offset transform does not have correct arguments', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: [[ 'offset', 50, 'potato' ]]
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when reverse transform does not have correct arguments', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: [[ 'reverse', 'potato' ]]
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when rotate transform does not have correct arguments', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: [[ 'rotate', '45deg' ]]
    }

    expect(() => valid(s)).toThrow()
  })

  it('should throw when scale transform does not have correct arguments', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: [[ 'scale' ]]
    }

    expect(() => valid(s)).toThrow()
  })

  it('should not throw when transforms are valid', () => {
    const s = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 10,
      transforms: [
        [ 'moveIndex', -2 ],
        [ 'offset', 50, 25 ],
        [ 'reverse' ],
        [ 'rotate', 45 ],
        [ 'scale', 10, 'topLeft' ]
      ]
    }

    expect(() => valid(s)).not.toThrow()
  })
})

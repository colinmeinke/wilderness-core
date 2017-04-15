/* globals describe it expect */

import shape from '../src/shape'

describe('shape', () => {
  it('should throw if not passed a plain shape object', () => {
    expect(() => shape())
      .toThrow('The shape function must be passed at least one Plain Shape Object')
  })

  it('should throw when passed invalid plain shape object core props', () => {
    const invalidShape = { foo: 'bar' }
    expect(() => shape(invalidShape)).toThrow()
  })

  it('should throw when passed an invalid plain shape object name', () => {
    const invalidShape = { name: [], type: 'circle', cx: 50, cy: 50, r: 10 }
    expect(() => shape(invalidShape)).toThrow()
  })

  it('should throw when passed invalid plain shape object tween props', () => {
    const validShape = { type: 'rect', width: 50, height: 50, x: 100, y: 100 }
    const invalidShape = { type: 'circle', cx: 50, cy: 50, r: 10, delay: -100 }
    expect(() => shape(validShape, invalidShape)).toThrow()
  })

  it('should throw when passed invalid name option', () => {
    const s = { type: 'rect', width: 50, height: 50, x: 100, y: 100 }
    expect(() => shape(s, { name: [] })).toThrow()
  })

  it('should return an object with the correct props', () => {
    const name = 'CIRCLE'

    const circle = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20,
      fill: '#E54'
    }

    const s = shape(circle, { name })

    expect(s).toHaveProperty('keyframes')
    expect(s).toHaveProperty('duration')
    expect(s.name).toEqual(name)
  })

  it('should return an object with multiple keyframes', () => {
    const circle = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20,
      fill: '#E54'
    }

    const square = {
      type: 'rect',
      width: 50,
      height: 50,
      x: 100,
      y: 100
    }

    const { keyframes } = shape(circle, square)

    expect(keyframes.length).toEqual(2)
  })

  it('should return an object with the correct duration', () => {
    const d = 600

    const circle = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20,
      fill: '#E54'
    }

    const square = {
      type: 'rect',
      width: 50,
      height: 50,
      x: 100,
      y: 100,
      duration: d
    }

    const { duration } = shape(circle, square)

    expect(duration).toEqual(d)
  })
})

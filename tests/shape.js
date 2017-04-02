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

  it('should return an object with the correct props', () => {
    const circle = {
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20,
      fill: '#E54'
    }

    const s = shape(circle)

    expect(s).toHaveProperty('keyframes')
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

    const s = shape(circle, square)

    expect(s.keyframes.length).toEqual(2)
  })
})

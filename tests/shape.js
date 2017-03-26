/* globals describe it expect */

import shape from '../src/shape'

describe('shape', () => {
  it('should throw if not passed a plain shape object', () => {
    expect(() => shape())
      .toThrow('The shape function must be passed at least one Plain Shape Object')
  })

  it('should throw when passed an invalid plain shape object', () => {
    const invalidShape = { foo: 'bar' }
    expect(() => shape(invalidShape)).toThrow()
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
})

/* globals describe it expect */

import shape from '../src/shape'

describe('shape', () => {
  it('should throw when passed an invalid plain shape object', () => {
    const invalidShape = { foo: 'bar' }
    expect(() => shape(invalidShape)).toThrow()
  })
})

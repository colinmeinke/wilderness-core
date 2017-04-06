/* globals describe it expect */

import timeline from '../src/timeline'

describe('shape', () => {
  it('should throw if not passed a shape', () => {
    expect(() => timeline())
      .toThrow('The timeline function must be passed at least one Shape')
  })
})

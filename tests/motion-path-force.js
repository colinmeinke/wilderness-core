/* globals describe it expect */

import motionPath from '../src/motion-path-force'

describe('motionPath', () => {
  it('should throw when passed a group shape', () => {
    expect(() => motionPath({
      type: 'g',
      shapes: [{ type: 'path', d: 'M0,0L10' }]
    }))
      .toThrow(`A motion path cannot be a group shape`)
  })
})

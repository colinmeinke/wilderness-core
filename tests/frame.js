/* globals describe it expect */

import frame from '../src/frame'
import shape from '../src/shape'
import timeline from '../src/timeline'

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

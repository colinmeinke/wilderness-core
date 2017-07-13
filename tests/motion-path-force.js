/* globals describe it expect */

import { frameShapeFromPlainShapeObject } from '../src/frame'
import motionPath from '../src/motion-path-force'

describe('motionPath', () => {
  it('should throw when passed a group shape', () => {
    expect(() => motionPath({
      type: 'g',
      shapes: [{ type: 'path', d: 'M0,0L10' }]
    }))
      .toThrow(`A motion path cannot be a group shape`)
  })

  it('should return a function', () => {
    expect(typeof motionPath({ type: 'path', d: 'M0,0L10' })).toBe('function')
  })

  it('should return a FrameShape when the function is called', () => {
    const force = motionPath({ type: 'path', d: 'M0,0H10' })

    const frameShape = frameShapeFromPlainShapeObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    const nextFrameShape = force(frameShape, 1)

    expect(nextFrameShape).toHaveProperty('attributes')
    expect(nextFrameShape).toHaveProperty('points')
  })

  it('should apply a motion path to a FrameShape', () => {
    const force = motionPath({ type: 'path', d: 'M0,0H10' })

    const frameShape = frameShapeFromPlainShapeObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    const expectedPoints = [
      { x: 10, y: 0, moveTo: true },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 10, y: 10 },
      { x: 10, y: 0 }
    ]

    const { points } = force(frameShape, 1)

    expect(points).toEqual(expectedPoints)
  })
})

/* globals describe it expect */

import { frameShapeFromPlainShapeObject } from '../src/frame'
import transform from '../src/transform'

describe('transform', () => {
  it('applies moveIndex transform correctly', () => {
    const frameShape = frameShapeFromPlainShapeObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    const expectedFrameShape = {
      attributes: {},
      points: [
        { x: 0, y: 10, moveTo: true },
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ]
    }

    expect(transform(frameShape, [[ 'moveIndex', 3 ]]))
      .toEqual(expectedFrameShape)
  })

  it('applies offset transform correctly', () => {
    const frameShape = frameShapeFromPlainShapeObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    const expectedFrameShape = {
      attributes: {},
      points: [
        { x: 10, y: 10, moveTo: true },
        { x: 20, y: 10 },
        { x: 20, y: 20 },
        { x: 10, y: 20 },
        { x: 10, y: 10 }
      ]
    }

    expect(transform(frameShape, [[ 'offset', 10, 10 ]]))
      .toEqual(expectedFrameShape)
  })

  it('applies reverse transform correctly', () => {
    const frameShape = frameShapeFromPlainShapeObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    const expectedFrameShape = {
      attributes: {},
      points: [
        { x: 0, y: 0, moveTo: true },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
        { x: 10, y: 0 },
        { x: 0, y: 0 }
      ]
    }

    expect(transform(frameShape, [[ 'reverse' ]]))
      .toEqual(expectedFrameShape)
  })

  it('applies rotate transform correctly', () => {
    const frameShape = frameShapeFromPlainShapeObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    const expectedFrameShape = {
      attributes: {},
      points: [
        { x: 10, y: 0, moveTo: true },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 },
        { x: 10, y: 0 }
      ]
    }

    expect(transform(frameShape, [[ 'rotate', 90 ]]))
      .toEqual(expectedFrameShape)
  })

  it('applies scale transform correctly', () => {
    const frameShape = frameShapeFromPlainShapeObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    const expectedFrameShape = {
      attributes: {},
      points: [
        { x: 0, y: 0, moveTo: true },
        { x: 20, y: 0 },
        { x: 20, y: 20 },
        { x: 0, y: 20 },
        { x: 0, y: 0 }
      ]
    }

    expect(transform(frameShape, [[ 'scale', 2, 'topLeft' ]]))
      .toEqual(expectedFrameShape)
  })

  it('applies compounds multiple transforms correctly', () => {
    const frameShape = frameShapeFromPlainShapeObject({
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10
    })

    const expectedFrameShape = {
      attributes: {},
      points: [
        { x: 15, y: 20, moveTo: true },
        { x: 15, y: 0 },
        { x: -5, y: 0 },
        { x: -5, y: 20 },
        { x: 15, y: 20 }
      ]
    }

    expect(transform(frameShape, [
      [ 'scale', 2, 'topLeft' ],
      [ 'reverse' ],
      [ 'moveIndex', 2 ],
      [ 'offset', -5, 0 ]
    ]))
      .toEqual(expectedFrameShape)
  })
})

/* globals describe it expect */

import { frameShapeFromPlainShapeObject } from '../src/frame'
import transform, { transformPoints } from '../src/transform'

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

  it('compounds multiple transforms correctly', () => {
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

  it('to not destroy to child frame shapes', () => {
    const frameShape = frameShapeFromPlainShapeObject({
      type: 'g',
      shapes: [
        { type: 'path', d: 'M0,0L20,10L0,20Z' },
        { type: 'path', d: 'M20,10L40,20L20,30Z' },
        { type: 'path', d: 'M0,20L20,30L0,40Z' }
      ]
    })

    const { childFrameShapes } = transform(frameShape, [[ 'scale', 0.8 ]])

    expect(childFrameShapes[ 0 ]).not.toBeUndefined()
    expect(childFrameShapes[ 1 ]).not.toBeUndefined()
    expect(childFrameShapes[ 2 ]).not.toBeUndefined()
  })

  it('applies transforms to a deep nested frame shape', () => {
    const frameShape = frameShapeFromPlainShapeObject({
      type: 'g',
      shapes: [
        { type: 'rect', x: 0, y: 0, width: 10, height: 10 },
        { type: 'rect', x: 10, y: 0, width: 10, height: 10 },
        {
          type: 'g',
          shapes: [
            { type: 'rect', x: 0, y: 10, width: 10, height: 10 },
            {
              type: 'g',
              shapes: [{ type: 'rect', x: 10, y: 10, width: 10, height: 10 }]
            }
          ]
        }
      ]
    })

    const { childFrameShapes: expectedChildFrameShapes } = frameShapeFromPlainShapeObject({
      type: 'g',
      shapes: [
        { type: 'rect', x: 5, y: 5, width: 5, height: 5 },
        { type: 'rect', x: 10, y: 5, width: 5, height: 5 },
        {
          type: 'g',
          shapes: [
            { type: 'rect', x: 5, y: 10, width: 5, height: 5 },
            {
              type: 'g',
              shapes: [{ type: 'rect', x: 10, y: 10, width: 5, height: 5 }]
            }
          ]
        }
      ]
    })

    const { childFrameShapes } = transform(frameShape, [[ 'scale', 0.5 ]])

    expect(childFrameShapes[ 0 ]).toEqual(expectedChildFrameShapes[ 0 ])
    expect(childFrameShapes[ 1 ]).toEqual(expectedChildFrameShapes[ 1 ])
    expect(childFrameShapes[ 2 ].childFrameShapes[ 0 ]).toEqual(expectedChildFrameShapes[ 2 ].childFrameShapes[ 0 ])
    expect(childFrameShapes[ 2 ].childFrameShapes[ 1 ].childFrameShapes[ 0 ]).toEqual(expectedChildFrameShapes[ 2 ].childFrameShapes[ 1 ].childFrameShapes[ 0 ])
  })
})

describe('transformPoints', () => {
  it('should transform points', () => {
    const points = [
      { x: 0, y: 0, moveTo: true },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ]

    const expectedPoints = [
      { x: 10, y: 10, moveTo: true },
      { x: 20, y: 10 },
      { x: 20, y: 20 },
      { x: 10, y: 20 },
      { x: 10, y: 10 }
    ]

    expect(transformPoints(points, [[ 'offset', 10, 10 ]])).toEqual(expectedPoints)
  })
})

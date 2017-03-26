/* globals describe it expect */

import keyframes from '../src/keyframe'

describe('keyframes', () => {
  it('should return items with the correct props', () => {
    const plainShapeObjects = [{
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20
    }]

    const [ k ] = keyframes(plainShapeObjects)

    expect(k).toHaveProperty('position')
    expect(k).toHaveProperty('keyframeShape')
  })

  it('should return items with the correct keyframeShape props', () => {
    const plainShapeObjects = [{
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20
    }]

    const [ k ] = keyframes(plainShapeObjects)
    const { keyframeShape } = k

    expect(keyframeShape).toHaveProperty('points')
    expect(keyframeShape).toHaveProperty('styles')
  })

  it('should return items with a valid keyframeShape.points prop', () => {
    const plainShapeObjects = [{
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20
    }]

    const [ k ] = keyframes(plainShapeObjects)
    const { keyframeShape: { points } } = k

    const expectedPoints = [
      { x: 50, y: 30, moveTo: true },
      { x: 50, y: 70, curve: { type: 'arc', rx: 20, ry: 20, sweepFlag: 1 } },
      { x: 50, y: 30, curve: { type: 'arc', rx: 20, ry: 20, sweepFlag: 1 } }
    ]

    expect(points).toEqual(expectedPoints)
  })

  it('should return items with a keyframeShape.points prop of null when passed a g Plain Shape Object', () => {
    const plainShapeObjects = [{
      type: 'g',
      shapes: [{
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20
      }]
    }]

    const [ k ] = keyframes(plainShapeObjects)
    const { keyframeShape: { points } } = k

    expect(points).toBe(null)
  })

  it('should return an item with a keyframeShape.childKeyframeShapes prop', () => {
    const plainShapeObjects = [{
      type: 'g',
      shapes: [{
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20
      }]
    }]

    const [ k ] = keyframes(plainShapeObjects)
    const { keyframeShape } = k

    expect(keyframeShape).toHaveProperty('childKeyframeShapes')
  })
})

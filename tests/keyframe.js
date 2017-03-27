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

    expect(k).toHaveProperty('name')
    expect(k).toHaveProperty('position')
    expect(k).toHaveProperty('frameShape')
  })

  it('should set the item name prop to ', () => {
    const name = 'CIRCLE'

    const plainShapeObjects = [{
      name,
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20
    }]

    const [ k ] = keyframes(plainShapeObjects)

    expect(k.name).toBe(name)
  })

  it('should return items with the correct frameShape props', () => {
    const plainShapeObjects = [{
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20
    }]

    const [ k ] = keyframes(plainShapeObjects)
    const { frameShape } = k

    expect(frameShape).toHaveProperty('points')
    expect(frameShape).toHaveProperty('styles')
    expect(frameShape).toHaveProperty('tween')
  })

  it('should return items with a valid frameShape.points prop', () => {
    const plainShapeObjects = [{
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20
    }]

    const [ k ] = keyframes(plainShapeObjects)
    const { frameShape: { points } } = k

    const expectedPoints = [
      { x: 50, y: 30, moveTo: true },
      { x: 50, y: 70, curve: { type: 'arc', rx: 20, ry: 20, sweepFlag: 1 } },
      { x: 50, y: 30, curve: { type: 'arc', rx: 20, ry: 20, sweepFlag: 1 } }
    ]

    expect(points).toEqual(expectedPoints)
  })

  it('should return items with a frameShape.points prop of null when passed a g Plain Shape Object', () => {
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
    const { frameShape: { points } } = k

    expect(points).toBe(null)
  })

  it('should return an item with a frameShape.childFrameShapes prop', () => {
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
    const { frameShape } = k

    expect(frameShape).toHaveProperty('childFrameShapes')
  })
})

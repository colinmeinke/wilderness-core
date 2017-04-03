/* globals describe it expect */

import config from '../src/config'
import keyframes from '../src/keyframe'

describe('keyframes', () => {
  it('should return items with the correct props', () => {
    const plainShapeObjects = [
      {
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20
      },
      {
        type: 'rect',
        width: 50,
        height: 50,
        x: 100,
        y: 100
      }
    ]

    const [ k1, k2 ] = keyframes(plainShapeObjects)

    expect(k1).toHaveProperty('name')
    expect(k1).toHaveProperty('position')
    expect(k1).toHaveProperty('frameShape')
    expect(k1.tween).toBeUndefined()
    expect(k2).toHaveProperty('tween')
    expect(k2.tween).toHaveProperty('duration')
    expect(k2.tween).toHaveProperty('easing')
    expect(k2.tween.duration).toBe(config.defaults.keyframes.duration)
    expect(typeof k2.tween.easing).toBe('function')
  })

  it('should return items with the correct keyframe tween props', () => {
    const dur = 1000
    const easingFunction = () => 5

    const plainShapeObjects = [
      {
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20
      },
      {
        type: 'rect',
        width: 50,
        height: 50,
        x: 100,
        y: 100,
        duration: dur,
        easing: easingFunction
      }
    ]

    const [ , k ] = keyframes(plainShapeObjects)
    const { tween: { duration, easing } } = k

    expect(duration).toBe(dur)
    expect(easing).toBe(easingFunction)
  })

  it('should add an extra keyframe if a plain shape object has a delay prop', () => {
    const plainShapeObjects = [
      {
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20
      },
      {
        type: 'rect',
        width: 50,
        height: 50,
        x: 100,
        y: 100,
        delay: 1000
      }
    ]

    const k = keyframes(plainShapeObjects)

    expect(k.length).toEqual(3)
  })

  it('should return items with the correct position props', () => {
    const plainShapeObjects = [
      {
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20
      },
      {
        type: 'rect',
        width: 50,
        height: 50,
        x: 100,
        y: 100,
        delay: 1000
      }
    ]

    const [ k1, k2, k3 ] = keyframes(plainShapeObjects)

    expect(k1.position).toEqual(0)
    expect(k2.position).toEqual(1000 / 1250)
    expect(k3.position).toEqual(1)
  })

  it('should set the item name prop', () => {
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
    const plainShapeObjects = [
      {
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20
      }
    ]

    const [ k ] = keyframes(plainShapeObjects)
    const { frameShape } = k

    expect(frameShape).toHaveProperty('points')
    expect(frameShape).toHaveProperty('styles')
  })

  it('should return group item with the correct frameShape props', () => {
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
    const [ childFrameShape ] = frameShape.childFrameShapes

    expect(frameShape).toHaveProperty('childFrameShapes')
    expect(frameShape.points).toBeUndefined()
    expect(childFrameShape).toHaveProperty('points')
    expect(childFrameShape).toHaveProperty('styles')
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
})

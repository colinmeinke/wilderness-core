/* globals describe it expect */

import config from '../src/config'
import keyframesAndDuration from '../src/keyframe'

describe('keyframes', () => {
  it('should return keyframes with the correct props', () => {
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

    const { keyframes } = keyframesAndDuration(plainShapeObjects)
    const [ k1, k2 ] = keyframes

    expect(k1).toHaveProperty('name')
    expect(k1).toHaveProperty('position')
    expect(k1).toHaveProperty('frameShape')
    expect(k1.tween).toBeUndefined()
    expect(k2).toHaveProperty('tween')
    expect(k2.tween).toHaveProperty('duration')
    expect(k2.tween).toHaveProperty('easing')
    expect(k2.tween.duration).toBe(config.defaults.keyframe.duration)
    expect(typeof k2.tween.easing).toBe('function')
  })

  it('should return keyframes with the correct keyframe tween props', () => {
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

    const { keyframes } = keyframesAndDuration(plainShapeObjects)
    const [ , k ] = keyframes
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

    const { keyframes } = keyframesAndDuration(plainShapeObjects)

    expect(keyframes.length).toEqual(3)
  })

  it('should return keyframes with the correct position props', () => {
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

    const { keyframes } = keyframesAndDuration(plainShapeObjects)
    const [ k1, k2, k3 ] = keyframes

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

    const { keyframes } = keyframesAndDuration(plainShapeObjects)
    const [ k ] = keyframes

    expect(k.name).toBe(name)
  })

  it('should return keyframes with the correct frameShape props', () => {
    const plainShapeObjects = [
      {
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20
      }
    ]

    const { keyframes } = keyframesAndDuration(plainShapeObjects)
    const [ k ] = keyframes
    const { frameShape } = k

    expect(frameShape).toHaveProperty('points')
    expect(frameShape).toHaveProperty('attributes')
  })

  it('should return keyframes with the correct frameShape attributes prop', () => {
    const plainShapeObjects = [
      {
        type: 'circle',
        cx: 50,
        cy: 50,
        r: 20,
        fill: 'red',
        stroke: 'rgba(255,80,75,0.5)',
        'stroke-dasharray': '10, 5',
        'class': 'circle',
        'data-foo': 5,
        fooBar: 1
      }
    ]

    const { keyframes } = keyframesAndDuration(plainShapeObjects)
    const [ k ] = keyframes
    const { frameShape: { attributes } } = k

    expect(attributes.fill).toBe('red')
    expect(attributes.stroke).toBe('rgba(255,80,75,0.5)')
    expect(attributes['stroke-dasharray']).toBe('10, 5')
    expect(attributes['class']).toBe('circle')
    expect(attributes['data-foo']).toBe(5)
    expect(attributes.fooBar).toBe(1)
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

    const { keyframes } = keyframesAndDuration(plainShapeObjects)
    const [ k ] = keyframes
    const { frameShape } = k
    const [ childFrameShape ] = frameShape.childFrameShapes

    expect(frameShape).toHaveProperty('childFrameShapes')
    expect(frameShape.points).toBeUndefined()
    expect(childFrameShape).toHaveProperty('points')
    expect(childFrameShape).toHaveProperty('attributes')
  })

  it('should return keyframes with a valid frameShape.points prop', () => {
    const plainShapeObjects = [{
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 20
    }]

    const { keyframes } = keyframesAndDuration(plainShapeObjects)
    const [ k ] = keyframes
    const { frameShape: { points } } = k

    const expectedPoints = [
      { x: 50, y: 30, moveTo: true },
      { x: 50, y: 70, curve: { type: 'arc', rx: 20, ry: 20, sweepFlag: 1 } },
      { x: 50, y: 30, curve: { type: 'arc', rx: 20, ry: 20, sweepFlag: 1 } }
    ]

    expect(points).toEqual(expectedPoints)
  })

  it('should return the correct default duration', () => {
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
      },
      {
        type: 'rect',
        width: 50,
        height: 50,
        x: 100,
        y: 100
      }
    ]

    const { duration } = keyframesAndDuration(plainShapeObjects)

    expect(duration).toBe(config.defaults.keyframe.duration * 2)
  })

  it('should return the correct duration', () => {
    const duration1 = 720
    const duration2 = 291

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
        duration: duration1
      },
      {
        type: 'rect',
        width: 50,
        height: 50,
        x: 100,
        y: 100,
        duration: duration2
      }
    ]

    const { duration } = keyframesAndDuration(plainShapeObjects)

    expect(duration).toBe(duration1 + duration2)
  })
})

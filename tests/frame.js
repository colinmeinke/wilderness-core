/* globals describe it expect */

import frame, {
  commonPointsStructure,
  pointsStructure,
  position,
  restructureFrameShape,
  splitLines,
  tween
} from '../src/frame'
import shape from '../src/shape'
import { toPoints } from 'svg-points'
import timeline from '../src/timeline'
import { linear } from 'tween-functions'

describe('position', () => {
  it('should calculate the correct position if finished', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: false,
      started: 0
    }, 1001)).toBeCloseTo(1)
  })

  it('should calculate correct position if not started', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 1.8,
      iterations: 1,
      reverse: false
    }, 1000)).toBeCloseTo(0.8)
  })

  it('should calculate correct position if not started and in reverse', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 1.8,
      iterations: 1,
      reverse: true
    }, 1000)).toBeCloseTo(0.2)
  })

  it('should calculate correct position if not started and alternating', () => {
    expect(position({
      alternate: true,
      delay: 0,
      duration: 1000,
      initialIterations: 1.8,
      iterations: 1,
      reverse: false
    }, 1000)).toBeCloseTo(0.2)
  })

  it('should calculate correct position if not started and alternating in reverse', () => {
    expect(position({
      alternate: true,
      delay: 0,
      duration: 1000,
      initialIterations: 1.8,
      iterations: 1,
      reverse: true
    }, 1000)).toBeCloseTo(0.8)
  })

  it('should calculate the correct position during first iteration', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: false,
      started: 0
    }, 600)).toBeCloseTo(0.6)
  })

  it('should calculate the correct position after multiple iterations', () => {
    expect(position({
      alternate: false,
      delay: 0,
      duration: 1000,
      initialIterations: 0,
      iterations: 5,
      reverse: false,
      started: 0
    }, 2600)).toBeCloseTo(0.6)
  })

  it('should calculate the correct position with delay', () => {
    expect(position({
      alternate: false,
      delay: 500,
      duration: 1000,
      initialIterations: 0,
      iterations: 1,
      reverse: false,
      started: 0
    }, 750)).toBeCloseTo(0.25)
  })

  it('should calculate the correct position with complex options', () => {
    const options = {
      alternate: true,
      delay: 500,
      duration: 1000,
      initialIterations: 1.75,
      iterations: 7,
      reverse: true,
      started: 250
    }

    expect(position(options, 3000)).toBeCloseTo(1)
    expect(position(options, 3250)).toBeCloseTo(0.75)
  })
})

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

  it(`should return the first keyframe's frame shapes if not started`, () => {
    const keyframe1 = { type: 'rect', width: 10, height: 10, x: 0, y: 0 }
    const keyframe2 = { ...keyframe1, x: 10 }
    const square = shape(keyframe1, keyframe2)
    const animation = timeline(square)

    expect(frame(animation, 500)[ 0 ].points)
      .toEqual(toPoints(keyframe1))
  })

  it(`should return the last keyframe's frame shapes if finished`, () => {
    const keyframe1 = { type: 'rect', width: 10, height: 10, x: 0, y: 0 }
    const keyframe2 = { ...keyframe1, x: 10 }
    const square = shape(keyframe1, keyframe2)
    const animation = timeline(square, { duration: 100, started: 0 })

    expect(frame(animation, 500)[ 0 ].points)
      .toEqual(toPoints(keyframe2))
  })

  it('should calculate the correct tween during playback', () => {
    const keyframe1 = { type: 'rect', width: 10, height: 10, x: 0, y: 0 }
    const keyframe2 = { ...keyframe1, x: 10, duration: 1000, easing: 'linear' }
    const square = shape(keyframe1, keyframe2)
    const animation = timeline(square, { started: 0 })

    expect(frame(animation, 500)[ 0 ].points)
      .toEqual(toPoints({ ...keyframe1, x: 5 }))
  })

  it('should tween attributes', () => {
    const keyframe1 = { type: 'rect', width: 10, height: 10, x: 0, y: 0, 'data-foo': 0 }
    const keyframe2 = { ...keyframe1, duration: 1000, easing: 'linear', 'data-foo': 10 }
    const square = shape(keyframe1, keyframe2)
    const animation = timeline(square, { started: 0 })

    expect(frame(animation, 500)[ 0 ].attributes[ 'data-foo' ]).toEqual(5)
  })
})

describe('tween', () => {
  it('should throw if passed arguments that are not structurally identicle', () => {
    expect(() => tween(2, 'foo', linear, 0.5))
      .toThrow(`The tween function's from and to arguments must be of an identicle structure`)
  })

  it('should tween correctly between numbers', () => {
    expect(tween(0, 10, linear, 0.75)).toBe(7.5)
  })

  it('should tween correctly between arrays', () => {
    const expected = [ 7.5, 0.075 ]

    tween([ 0, 0 ], [ 10, 0.1 ], linear, 0.75).map((v, i) => {
      expect(v).toBeCloseTo(expected[ i ])
    })
  })

  it('should tween correctly between objects', () => {
    const expected = { foo: 7.5, bar: 0.075 }
    const result = tween({ foo: 0, bar: 0 }, { foo: 10, bar: 0.1 }, linear, 0.75)

    Object.keys(result).map(k => {
      expect(result[ k ]).toBeCloseTo(expected[ k ])
    })
  })

  it('should tween correctly between nested objects', () => {
    const expected = [ 'foo', 7.5, [ 0.075 ], { bar: 75 } ]

    const result = tween(
      [ 'foo', 0, [ 0 ], { bar: 0 } ],
      [ 'foo', 10, [ 0.1 ], { bar: 100 } ],
      linear,
      0.75
    )

    expect(result[ 0 ]).toBe(expected[ 0 ])
    expect(result[ 1 ]).toBe(expected[ 1 ])
    expect(result[ 2 ][ 0 ]).toBeCloseTo(expected[ 2 ][ 0 ])
    expect(result[ 3 ].bar).toBe(expected[ 3 ].bar)
  })
})

describe('pointsStructure', () => {
  it('should return correct structure for basic frame shape', () => {
    const points = [ { moveTo: true }, {}, {} ]
    expect(pointsStructure({ points })).toEqual([ 3 ])
  })

  it('should return correct structure for multi-line frame shape', () => {
    const points = [ { moveTo: true }, {}, {}, { moveTo: true }, {} ]
    expect(pointsStructure({ points })).toEqual([ 3, 2 ])
  })

  it('should return correct structure for group frame shape', () => {
    const points1 = [ { moveTo: true }, {}, {}, { moveTo: true }, {} ]
    const points2 = [ { moveTo: true }, {}, {}, {}, {}, {} ]

    const frameShape = {
      childFrameShapes: [
        { points: points1 },
        { points: points2 }
      ]
    }
    expect(pointsStructure(frameShape)).toEqual([[ 3, 2 ], [ 6 ]])
  })

  it('should return correct structure for deep group frame shape', () => {
    const points1 = [ { moveTo: true }, {}, {}, { moveTo: true }, {} ]
    const points2 = [ { moveTo: true }, {}, {}, {}, {}, {} ]
    const points3 = [ { moveTo: true }, {} ]

    const frameShape = {
      childFrameShapes: [
        { points: points1 },
        { childFrameShapes: [
          { points: points2 },
          { points: points3 }
        ] }
      ]
    }
    expect(pointsStructure(frameShape)).toEqual([[ 3, 2 ], [[ 6 ], [ 2 ]]])
  })
})

describe('commonPointsStructure', () => {
  it('should return correct structure for basic structures', () => {
    const structures = [[ 2 ], [ 9 ], [ 4 ]]
    expect(commonPointsStructure(structures)).toEqual([ 9 ])
  })

  it('should return correct structure for multi-line structures', () => {
    const structures = [[ 5 ], [ 2, 9 ]]
    expect(commonPointsStructure(structures)).toEqual([ 5, 9 ])
  })

  it('should return correct structure for group structures', () => {
    const structures = [[ 5 ], [[ 3 ], [ 2, 7, 1 ]]]
    expect(commonPointsStructure(structures)).toEqual([[ 5 ], [ 2, 7, 1 ]])
  })

  it('should return correct stucture for deep group structures', () => {
    const structures = [[ 5 ], [[[ 3 ], [ 9 ]], [ 2, 7, 1 ]]]
    expect(commonPointsStructure(structures)).toEqual([[[ 5 ], [ 9 ]], [ 2, 7, 1 ]])
  })
})

describe('restructureFrameShape', () => {
  it('should restructure a basic frameShape with additional points', () => {
    const frameShape = {
      attributes: {},
      points: [
        { x: 0, y: 0, moveTo: true },
        { x: 10, y: 10 }
      ]
    }

    const structure = [ 9 ]

    expect(restructureFrameShape(frameShape, structure).points.length).toBe(9)
  })

  it('should restructure a basic frameShape with additional lines', () => {
    const frameShape = {
      attributes: {},
      points: [
        { x: 0, y: 0, moveTo: true },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 }
      ]
    }

    const structure = [ 9, 4 ]

    const lines = splitLines(restructureFrameShape(frameShape, structure).points)

    expect(lines[ 0 ].length).toBe(9)
    expect(lines[ 1 ].length).toBe(4)
  })

  it('should restructure a basic frameShape to a group', () => {
    const frameShape = {
      attributes: {},
      points: [
        { x: 0, y: 0, moveTo: true },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 }
      ]
    }

    const structure = [[ 9 ], [ 4 ]]

    const restructuredFrameShape = restructureFrameShape(frameShape, structure)

    expect(restructuredFrameShape.points).toBeUndefined()
    expect(restructuredFrameShape.childFrameShapes[ 0 ].points.length).toBe(9)
    expect(restructuredFrameShape.childFrameShapes[ 1 ].points.length).toBe(4)
  })

  it('should restructure a complex frameShape', () => {
    const frameShape = {
      attributes: {},
      points: [
        { x: 0, y: 0, moveTo: true },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 }
      ]
    }

    const structure = [[[ 9 ], [[ 2 ], [ 15 ]]], [ 4 ]]

    const restructuredFrameShape = restructureFrameShape(frameShape, structure)

    expect(restructuredFrameShape.points).toBeUndefined()
    expect(restructuredFrameShape.childFrameShapes[ 0 ].points).toBeUndefined()
    expect(restructuredFrameShape.childFrameShapes[ 0 ].childFrameShapes[ 0 ].points.length).toBe(9)
    expect(restructuredFrameShape.childFrameShapes[ 0 ].childFrameShapes[ 1 ].points).toBeUndefined()
    expect(restructuredFrameShape.childFrameShapes[ 0 ].childFrameShapes[ 1 ].childFrameShapes[ 0 ].points.length).toBe(2)
    expect(restructuredFrameShape.childFrameShapes[ 0 ].childFrameShapes[ 1 ].childFrameShapes[ 1 ].points.length).toBe(15)
    expect(restructuredFrameShape.childFrameShapes[ 1 ].points.length).toBe(4)
  })

  it('should restructure a group frameShape', () => {
    const frameShape = {
      attributes: {},
      childFrameShapes: [
        {
          attributes: {},
          points: [
            { x: 0, y: 0, moveTo: true },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
            { x: 0, y: 0 }
          ]
        },
        {
          attributes: {},
          points: [
            { x: 0, y: 0, moveTo: true },
            { x: 10, y: 0 }
          ]
        }
      ]
    }

    const structure = [[ 5 ], [[ 24, 3 ], [ 9 ]]]

    const restructuredFrameShape = restructureFrameShape(frameShape, structure)
    const lines = splitLines(restructuredFrameShape.childFrameShapes[ 1 ].childFrameShapes[ 0 ].points)

    expect(restructuredFrameShape.points).toBeUndefined()
    expect(restructuredFrameShape.childFrameShapes[ 0 ].points.length).toBe(5)
    expect(restructuredFrameShape.childFrameShapes[ 1 ].points).toBeUndefined()
    expect(lines[ 0 ].length).toBe(24)
    expect(lines[ 1 ].length).toBe(3)
    expect(restructuredFrameShape.childFrameShapes[ 1 ].childFrameShapes[ 1 ].points.length).toBe(9)
  })
})

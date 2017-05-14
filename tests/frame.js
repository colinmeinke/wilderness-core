/* globals describe it expect */

import frame, {
  addToPointStructure,
  applyCurveStructure,
  applyPointStructure,
  commonCurveStructure,
  commonPointStructure,
  curveStructure,
  pointStructure,
  splitLines,
  tween
} from '../src/frame'
import shape from '../src/shape'
import { toPoints } from 'svg-points'
import timeline from '../src/timeline'
import { linear } from 'tween-functions'

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

describe('pointStructure', () => {
  it('should return correct structure for basic frame shape', () => {
    const points = [ { moveTo: true }, {}, {} ]
    expect(pointStructure({ points })).toEqual([ 3 ])
  })

  it('should return correct structure for multi-line frame shape', () => {
    const points = [ { moveTo: true }, {}, {}, { moveTo: true }, {} ]
    expect(pointStructure({ points })).toEqual([ 3, 2 ])
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
    expect(pointStructure(frameShape)).toEqual([[ 3, 2 ], [ 6 ]])
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
    expect(pointStructure(frameShape)).toEqual([[ 3, 2 ], [[ 6 ], [ 2 ]]])
  })
})

describe('addToPointStructure', () => {
  it('should insert point into empty structure', () => {
    expect(addToPointStructure([], 5, 0)).toEqual([ 5 ])
  })

  it('should insert point at correct index', () => {
    expect(addToPointStructure([ 10, 4, 1 ], 5, 2)).toEqual([ 10, 4, 5 ])
  })

  it('should insert array correctly', () => {
    expect(addToPointStructure([ 9 ], [ 5, 2 ], 0)).toEqual([[ 9, 2 ]])
  })

  it('should insert into array of arrays correctly', () => {
    expect(addToPointStructure([[ 5 ], [ 5 ], [ 5 ], [ 5 ]], 7, 0)).toEqual([[ 7 ], [ 5 ], [ 5 ], [ 5 ]])
  })
})

describe('commonPointStructure', () => {
  it('should return correct structure for basic structures', () => {
    const structures = [[ 2 ], [ 9 ], [ 4 ]]
    expect(commonPointStructure(structures)).toEqual([ 9 ])
  })

  it('should return correct structure for multi-line structures', () => {
    const structures = [[ 5 ], [ 2, 9 ]]
    expect(commonPointStructure(structures)).toEqual([ 5, 9 ])
  })

  it('should return correct structure for group structures', () => {
    const structures = [[ 5 ], [[ 3 ], [ 2, 7, 1 ]]]
    expect(commonPointStructure(structures)).toEqual([[ 5 ], [ 2, 7, 1 ]])
  })

  it('should return correct stucture for deep group structures', () => {
    const structures = [[ 5 ], [[[ 3 ], [ 9 ]], [ 2, 7, 1 ]]]
    expect(commonPointStructure(structures)).toEqual([[[ 5 ], [ 9 ]], [ 2, 7, 1 ]])
  })

  it('should return correct structure when mixed basic and group structures', () => {
    const structures = [[[ 5 ], [ 5 ], [ 5 ], [ 5 ]], [ 5 ]]
    expect(commonPointStructure(structures)).toEqual([[ 5 ], [ 5 ], [ 5 ], [ 5 ]])
  })
})

describe('applyPointStructure', () => {
  it('should restructure a basic frameShape with additional points', () => {
    const frameShape = {
      attributes: {},
      points: [
        { x: 0, y: 0, moveTo: true },
        { x: 10, y: 10 }
      ]
    }

    const structure = [ 9 ]

    expect(applyPointStructure(frameShape, structure).points.length).toBe(9)
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

    const lines = splitLines(applyPointStructure(frameShape, structure).points)

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

    const restructuredFrameShape = applyPointStructure(frameShape, structure)

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

    const restructuredFrameShape = applyPointStructure(frameShape, structure)

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

    const restructuredFrameShape = applyPointStructure(frameShape, structure)
    const lines = splitLines(restructuredFrameShape.childFrameShapes[ 1 ].childFrameShapes[ 0 ].points)

    expect(restructuredFrameShape.points).toBeUndefined()
    expect(restructuredFrameShape.childFrameShapes[ 0 ].points.length).toBe(5)
    expect(restructuredFrameShape.childFrameShapes[ 1 ].points).toBeUndefined()
    expect(lines[ 0 ].length).toBe(24)
    expect(lines[ 1 ].length).toBe(3)
    expect(restructuredFrameShape.childFrameShapes[ 1 ].childFrameShapes[ 1 ].points.length).toBe(9)
  })
})

describe('curveStructure', () => {
  it('should return correct structure for basic frame shape', () => {
    const points = [ { moveTo: true }, {}, { curve: {} }, {} ]
    expect(curveStructure({ points })).toEqual([ false, false, true, false ])
  })

  it('should return correct structure for group frame shape', () => {
    const points1 = [ { moveTo: true }, {}, { curve: {} }, { moveTo: true }, {} ]
    const points2 = [ { moveTo: true }, { curve: {} }, {}, {}, {}, { curve: {} } ]

    const frameShape = {
      childFrameShapes: [
        { points: points1 },
        { points: points2 }
      ]
    }

    expect(curveStructure(frameShape)).toEqual([
      [ false, false, true, false, false ],
      [ false, true, false, false, false, true ]
    ])
  })

  it('should return correct structure for deep group frame shape', () => {
    const points1 = [ { moveTo: true }, {}, {}, { moveTo: true }, { curve: {} } ]
    const points2 = [ { moveTo: true }, {}, { curve: {} }, {}, {}, {} ]
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

    expect(curveStructure(frameShape)).toEqual([
      [ false, false, false, false, true ],
      [
        [ false, false, true, false, false, false ],
        [ false, false ]
      ]
    ])
  })
})

describe('commonCurveStructure', () => {
  it('should return correct structure for basic structures', () => {
    const structures = [
      [ false, false, false ],
      [ false, true, false ],
      [ false, false, true ]
    ]

    expect(commonCurveStructure(structures)).toEqual([ false, true, true ])
  })

  it('should return correct structure for group structures', () => {
    const structures = [
      [[ false ], [ false, false, false ]],
      [[ false ], [ false, true, false ]]
    ]

    expect(commonCurveStructure(structures)).toEqual([
      [ false ],
      [ false, true, false ]
    ])
  })

  it('should return correct stucture for deep group structures', () => {
    const structures = [
      [[[ true ], [ false ]], [ false, true, false ]],
      [[[ false ], [ false ]], [ true, false, false ]],
      [[[ false ], [ false ]], [ true, false, true ]]
    ]

    expect(commonCurveStructure(structures)).toEqual([
      [[ true ], [ false ]],
      [ true, true, true ]
    ])
  })
})

describe('applyCurveStructure', () => {
  it('should add curves to basic structures', () => {
    const points = [
      { x: 0, y: 0, moveTo: true },
      { x: 0, y: 100 },
      { x: 50, y: 50 }
    ]

    const structure = [ false, true, true ]

    const expectedPoints = [
      { x: 0, y: 0, moveTo: true },
      { x: 0, y: 100, curve: { type: 'cubic', x1: 0, y1: 0, x2: 0, y2: 100 } },
      { x: 50, y: 50, curve: { type: 'cubic', x1: 0, y1: 100, x2: 50, y2: 50 } }
    ]

    expect(applyCurveStructure({ points }, structure).points)
      .toEqual(expectedPoints)
  })

  it('should add curves to group structures', () => {
    const points1 = [
      { x: 0, y: 0, moveTo: true },
      { x: 0, y: 100 }
    ]

    const points2 = [
      { x: 200, y: 300, moveTo: true },
      { x: 50, y: 50 }
    ]

    const frameShape = {
      childFrameShapes: [
        { points: points1 },
        { points: points2 }
      ]
    }

    const structure = [
      [ false, false ],
      [ false, true ]
    ]

    const expectedPoints1 = [
      { x: 0, y: 0, moveTo: true },
      { x: 0, y: 100 }
    ]

    const expectedPoints2 = [
      { x: 200, y: 300, moveTo: true },
      { x: 50, y: 50, curve: { type: 'cubic', x1: 200, y1: 300, x2: 50, y2: 50 } }
    ]

    const { childFrameShapes } = applyCurveStructure(frameShape, structure)

    expect(childFrameShapes[ 0 ].points).toEqual(expectedPoints1)
    expect(childFrameShapes[ 1 ].points).toEqual(expectedPoints2)
  })

  it('should add curves to deep group structures', () => {
    const points1 = [
      { x: 0, y: 0, moveTo: true },
      { x: 0, y: 100 }
    ]

    const points2 = [
      { x: 200, y: 300, moveTo: true },
      { x: 50, y: 50 }
    ]

    const frameShape = {
      childFrameShapes: [
        { points: points1 },
        { childFrameShapes: [ { points: points2 } ] }
      ]
    }

    const structure = [
      [ false, false ],
      [[ false, true ]]
    ]

    const expectedPoints1 = [
      { x: 0, y: 0, moveTo: true },
      { x: 0, y: 100 }
    ]

    const expectedPoints2 = [
      { x: 200, y: 300, moveTo: true },
      { x: 50, y: 50, curve: { type: 'cubic', x1: 200, y1: 300, x2: 50, y2: 50 } }
    ]

    const { childFrameShapes } = applyCurveStructure(frameShape, structure)

    expect(childFrameShapes[ 0 ].points).toEqual(expectedPoints1)
    expect(childFrameShapes[ 1 ].childFrameShapes[ 0 ].points).toEqual(expectedPoints2)
  })

  it('should convert all curves to cubic beziers', () => {
    const points = [
      { x: 50, y: 30, moveTo: true },
      { x: 50, y: 70, curve: { type: 'arc', rx: 20, ry: 20, sweepFlag: 1 } },
      { x: 50, y: 30, curve: { type: 'arc', rx: 20, ry: 20, sweepFlag: 1 } }
    ]

    const structure = [ false, true, true ]

    const frameShape = applyCurveStructure({ points }, structure)

    expect(frameShape.points[ 1 ].curve.type).toBe('cubic')
    expect(frameShape.points[ 2 ].curve.type).toBe('cubic')
  })
})

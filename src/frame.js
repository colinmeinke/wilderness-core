/* globals __DEV__ */

import { add, cubify } from 'points'
import clone from './clone'
import { output } from './middleware'
import { toPoints } from 'svg-points'
import { updateState } from './timeline'

/**
 * Shape data as specified by the
 * {@link https://github.com/colinmeinke/points Points spec}.
 *
 * @typedef {Object[]} Points
 */

/**
 * The data required to render a shape.
 *
 * @typedef {Object} FrameShape
 *
 * @property {Points} points
 * @property {Object} attributes
 * @property {FrameShape[]} childFrameShapes
 */

/**
 * A FrameShape array.
 *
 * @typedef {FrameShape[]} Frame
 */

/**
 * A number between 0 and 1 (inclusive).
 *
 * @typedef {number} Position
 */

/**
 * The structure of FrameShape Points.
 * An array represents a shape. A number represents a line.
 * An array that has nested arrays represents a group of shapes.
 *
 * @typedef {(number|number[])[]} PointStructure
 */

/**
 * The curve structure of FrameShape Points.
 * A boolean represents a point, and designates if the point is a curve.
 *
 * @typedef {(boolean|boolean[])[]} CurveStructure
 */

/**
 * Converts FrameShape Points to curves based on a CurveStructure.
 *
 * @param {FrameShape} frameShape
 * @param {CurveStructure} structure
 *
 * @returns {FrameShape}
 *
 * @example
 * applyCurveStructure(frameShape, stucture)
 */
const applyCurveStructure = (frameShape, structure) => {
  const points = frameShape.points
  const childFrameShapes = frameShape.childFrameShapes

  if (childFrameShapes) {
    const nextChildFrameShapes = []

    for (let i = 0, l = childFrameShapes.length; i < l; i++) {
      nextChildFrameShapes.push(
        applyCurveStructure(childFrameShapes[ i ], structure[ i ])
      )
    }

    frameShape.childFrameShapes = nextChildFrameShapes
  } else {
    let curves = false

    for (let i = 0, l = structure.length; i < l; i++) {
      if (structure[ i ]) {
        curves = true
        break
      }
    }

    if (curves) {
      const nextPoints = []
      const cubifiedPoints = cubify(points)

      for (let i = 0, l = cubifiedPoints.length; i < l; i++) {
        const point = cubifiedPoints[ i ]

        if (structure[ i ] && !point.curve) {
          nextPoints.push({
            ...point,
            curve: {
              type: 'cubic',
              x1: points[ i - 1 ].x,
              y1: points[ i - 1 ].y,
              x2: points[ i ].x,
              y2: points[ i ].y
            }
          })
        } else {
          nextPoints.push(point)
        }
      }

      frameShape.points = nextPoints
    }
  }

  return frameShape
}

/**
 * Restructures a FrameShape's Points based on a PointStructure.
 *
 * @param {FrameShape} frameShape
 * @param {PointStructure} structure
 *
 * @returns {FrameShape}
 *
 * @example
 * applyPointStructure(frameShape, stucture)
 */
const applyPointStructure = (frameShape, structure) => {
  if (Array.isArray(structure[ 0 ])) {
    if (!frameShape.childFrameShapes) {
      frameShape.childFrameShapes = [ clone(frameShape) ]
      delete frameShape.points
    }

    if (frameShape.childFrameShapes.length !== structure.length) {
      for (let i = 0, l = structure.length; i < l; i++) {
        if (i >= frameShape.childFrameShapes.length) {
          const previous = frameShape.childFrameShapes[ i - 1 ].points

          frameShape.childFrameShapes.push({
            attributes: clone(frameShape.attributes),
            points: [
              { ...clone(previous[ previous.length - 1 ]), moveTo: true },
              clone(previous[ previous.length - 1 ])
            ]
          })
        }
      }
    }

    const nextChildFrameShapes = []

    for (let i = 0, l = frameShape.childFrameShapes.length; i < l; i++) {
      nextChildFrameShapes.push(
        applyPointStructure(frameShape.childFrameShapes[ i ], structure[ i ])
      )
    }

    frameShape.childFrameShapes = nextChildFrameShapes
  } else {
    const lines = splitLines(frameShape.points)

    for (let i = 0, l = structure.length; i < l; i++) {
      const desiredPoints = structure[ i ]

      if (!lines[ i ]) {
        const previousLine = lines[ i - 1 ]

        lines[ i ] = [
          { ...clone(previousLine[ previousLine.length - 1 ]), moveTo: true },
          clone(previousLine[ previousLine.length - 1 ])
        ]
      }

      if (desiredPoints > lines[ i ].length) {
        lines[ i ] = add(lines[ i ], desiredPoints)
      }
    }

    frameShape.points = joinLines(lines)
  }

  return frameShape
}

/**
 * Add a value to a PointStucture at a defined position.
 *
 * @param {PointStructure} structure
 * @param {(number|number[])} value - Value to add to PointStructure.
 * @param {number} i - Position to add value at.
 *
 * @example
 * addToPointStructure([], 9, 0)
 */
const addToPointStructure = (structure, value, i) => {
  if (Array.isArray(value)) {
    if (!Array.isArray(structure[ i ])) {
      structure[ i ] = [ structure[ i ] ]
    }

    for (let _i = 0, l = value.length; _i < l; _i++) {
      structure[ i ] = addToPointStructure(structure[ i ], value[ _i ], _i)
    }
  } else {
    if (Array.isArray(structure[ i ])) {
      addToPointStructure(structure[ i ], value, 0)
    } else {
      structure[ i ] = Math.max(structure[ i ] || 0, value)
    }
  }

  return structure
}

/**
 * Creates a common CurveStructure from an array of CurveStructures.
 *
 * @param {CurveStructure[]} structures
 *
 * @returns {CurveStructure}
 *
 * @example
 * commonCurveStructure(structures)
 */
const commonCurveStructure = structures => {
  let structure = structures[ 0 ]

  for (let i = 1, l = structures.length; i < l; i++) {
    const s = structures[ i ]
    const c = []

    for (let _i = 0, _l = structure.length; _i < _l; _i++) {
      const x = structure[ _i ]

      if (Array.isArray(x)) {
        c.push(commonCurveStructure([ x, s[ _i ] ]))
      } else {
        c.push(x || s[ _i ])
      }
    }

    structure = c
  }

  return structure
}

/**
 * Creates a common PointStructure from an array of PointStructures.
 *
 * @param {PointStructure[]} structures
 *
 * @returns {PointStructure}
 *
 * @example
 * commonPointStructure(structures)
 */
const commonPointStructure = structures => {
  let structure = []

  for (let i = 0, l = structures.length; i < l; i++) {
    const s = structures[ i ]

    for (let _i = 0, _l = s.length; _i < _l; _i++) {
      structure = addToPointStructure(structure, s[ _i ], _i)
    }
  }

  return structure
}

/**
 * The current Frame of a Timeline.
 *
 * @param {Timeline} timeline
 * @param {number} [at]
 *
 * @returns {Frame}
 *
 * @example
 * frame(timeline)
 */
const frame = (timeline, at) => {
  if (__DEV__ && (typeof timeline !== 'object' || !timeline.timelineShapes || !timeline.playbackOptions)) {
    throw new TypeError(`The frame function's first argument must be a Timeline`)
  }

  if (__DEV__ && (typeof at !== 'undefined' && typeof at !== 'number')) {
    throw new TypeError(`The frame function's second argument must be of type number`)
  }

  updateState(timeline, typeof at !== 'undefined' ? at : Date.now())

  const frameShapes = []
  const timelineShapes = timeline.timelineShapes

  for (let i = 0, l = timelineShapes.length; i < l; i++) {
    const timelineShape = timelineShapes[ i ]
    const shape = timelineShape.shape
    const keyframes = shape.keyframes
    const timelinePosition = timelineShape.timelinePosition
    const start = timelinePosition.start
    const finish = timelinePosition.finish
    const position = timeline.state.position

    if (position <= start) {
      frameShapes.push(output(keyframes[ 0 ].frameShape, timeline.middleware))
    } else if (position >= finish) {
      frameShapes.push(output(keyframes[ keyframes.length - 1 ].frameShape, timeline.middleware))
    } else {
      const shapePosition = (position - start) / (finish - start)
      frameShapes.push(frameShapeFromShape(shape, shapePosition, timeline.middleware))
    }
  }

  return frameShapes
}

/**
 * Creates a FrameShape from a PlainShapeObject.
 *
 * @param {PlainShapeObject} plainShapeObject
 *
 * @returns {FrameShape}
 *
 * @example
 * frameShapeFromPlainShapeObject(circle)
 */
const frameShapeFromPlainShapeObject = ({ shapes: childPlainShapeObjects, ...plainShapeObject }) => {
  const {
    type,
    height,
    width,
    x,
    y,
    cx,
    cy,
    r,
    rx,
    ry,
    x1,
    x2,
    y1,
    y2,
    d,
    points,
    shapes,
    ...attributes
  } = plainShapeObject

  if (plainShapeObject.type === 'g' && childPlainShapeObjects) {
    const childFrameShapes = []

    for (let i = 0, l = childPlainShapeObjects.length; i < l; i++) {
      childFrameShapes.push(
        frameShapeFromPlainShapeObject(childPlainShapeObjects[ i ])
      )
    }

    return { attributes, childFrameShapes }
  }

  return {
    attributes,
    points: toPoints(plainShapeObject)
  }
}

/**
 * Creates a FrameShape from a Shape given the Position.
 *
 * @param {Shape} shape
 * @param {Position} position
 * @param {Middleware[]} middleware
 *
 * @returns {FrameShape}
 *
 * @example
 * frameShapeFromShape(shape, 0.75, [])
 */
const frameShapeFromShape = (shape, position, middleware) => {
  const { keyframes } = shape

  let fromIndex = 0

  for (let i = 0, l = keyframes.length; i < l; i++) {
    if (position > keyframes[ i ].position) {
      fromIndex = i
    }
  }

  const toIndex = fromIndex + 1

  const from = keyframes[ fromIndex ]
  const to = keyframes[ toIndex ]
  const keyframePosition = (position - from.position) / (to.position - from.position)
  const forces = to.tween.forces

  let frameShape = tween(
    from.frameShape,
    to.frameShape,
    to.tween.easing,
    keyframePosition
  )

  for (let i = 0, l = forces.length; i < l; i++) {
    frameShape = forces[ i ](frameShape, keyframePosition)
  }

  return output(frameShape, middleware)
}

/**
 * Joins an array of Points into Points.
 *
 * @param {Points[]} lines
 *
 * @returns {Points}
 *
 * @example
 * joinLines([ shape1, shape2 ])
 */
const joinLines = lines => [].concat(...lines)

/**
 * Creates a CurveStructure from a FrameShape.
 *
 * @param {FrameShape} frameShape
 *
 * @returns {CurveStructure}
 *
 * @example
 * curveStructure(frameShape)
 */
const curveStructure = ({ points, childFrameShapes }) => {
  const s = []

  if (childFrameShapes) {
    for (let i = 0, l = childFrameShapes.length; i < l; i++) {
      s.push(curveStructure(childFrameShapes[ i ]))
    }
  } else {
    for (let i = 0, l = points.length; i < l; i++) {
      s.push(typeof points[ i ].curve !== 'undefined')
    }
  }

  return s
}

/**
 * Creates a PointStructure from a FrameShape.
 *
 * @param {FrameShape} frameShape
 *
 * @returns {PointStructure}
 *
 * @example
 * pointStructure(frameShape)
 */
const pointStructure = ({ points, childFrameShapes }) => {
  if (childFrameShapes) {
    const s = []

    for (let i = 0, l = childFrameShapes.length; i < l; i++) {
      s.push(pointStructure(childFrameShapes[ i ]))
    }

    return s
  }

  let structure = []

  for (let i = 0, l = points.length; i < l; i++) {
    if (points[ i ].moveTo) {
      structure.push(1)
    } else {
      structure[ structure.length - 1 ]++
    }
  }

  return structure
}

/**
 * Splits Points at moveTo commands.
 *
 * @param {Points} points
 *
 * @return {Points[]}
 *
 * @example
 * splitLines(points)
 */
const splitLines = points => {
  const lines = []

  for (let i = 0, l = points.length; i < l; i++) {
    const point = points[ i ]

    if (point.moveTo) {
      lines.push([ point ])
    } else {
      lines[ lines.length - 1 ].push(point)
    }
  }

  return lines
}

/**
 * Tween between any two values.
 *
 * @param {*} from
 * @param {*} to - An identicle structure to the from param
 * @param {function} easing - The easing function to apply
 * @param {Position} position
 *
 * @returns {*}
 *
 * @example
 * tween(0, 100, easeOut, 0.75)
 */
const tween = (from, to, easing, position) => {
  if (typeof from === 'number') {
    if (__DEV__ && typeof to !== 'number') {
      throw new TypeError(`The tween function's from and to arguments must be of an identicle structure`)
    }

    if (from === to) {
      return from
    }

    return easing(position, from, to, 1)
  } else if (Array.isArray(from)) {
    if (__DEV__ && !Array.isArray(to)) {
      throw new TypeError(`The tween function's from and to arguments must be of an identicle structure`)
    }

    const arr = []

    for (let i = 0, l = from.length; i < l; i++) {
      arr.push(tween(from[ i ], to[ i ], easing, position))
    }

    return arr
  } else if (from !== null && typeof from === 'object') {
    if (__DEV__ && to !== null && typeof to !== 'object') {
      throw new TypeError(`The tween function's from and to arguments must be of an identicle structure`)
    }

    const obj = {}

    for (let k in from) {
      obj[ k ] = tween(from[ k ], to[ k ], easing, position)
    }

    return obj
  }

  return from
}

export {
  addToPointStructure,
  applyCurveStructure,
  applyPointStructure,
  commonCurveStructure,
  commonPointStructure,
  curveStructure,
  frameShapeFromPlainShapeObject,
  joinLines,
  pointStructure,
  splitLines,
  tween
}

export default frame

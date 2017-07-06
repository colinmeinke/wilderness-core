/* globals __DEV__ */

import { add, cubify } from 'points'
import clone from './clone'
import { output } from './middleware'
import { position } from './timeline'
import { toPoints } from 'svg-points'

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
  const { points, childFrameShapes } = frameShape

  if (childFrameShapes) {
    frameShape.childFrameShapes = childFrameShapes.map((childFrameShape, i) => (
      applyCurveStructure(childFrameShape, structure[ i ])
    ))
  } else {
    const curves = structure.reduce((a, b) => a || b)

    if (curves) {
      frameShape.points = cubify(points).map((point, i) => {
        if (structure[ i ] && !point.curve) {
          return {
            ...point,
            curve: {
              type: 'cubic',
              x1: points[ i - 1 ].x,
              y1: points[ i - 1 ].y,
              x2: points[ i ].x,
              y2: points[ i ].y
            }
          }
        }

        return point
      })
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
      structure.map((x, i) => {
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
      })
    }

    frameShape.childFrameShapes = frameShape.childFrameShapes.map((childFrameShape, i) => (
      applyPointStructure(childFrameShape, structure[ i ])
    ))
  } else {
    const lines = splitLines(frameShape.points)

    structure.map((desiredPoints, i) => {
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
    })

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

    value.reduce(addToPointStructure, structure[ i ])
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
const commonCurveStructure = structures => structures.reduce((structure, s) => (
  structure.map((x, i) => {
    if (Array.isArray(x)) {
      return commonCurveStructure([ x, s[ i ] ])
    }

    return x || s[ i ]
  })
))

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
const commonPointStructure = structures => structures.reduce((structure, s) => (
  s.reduce(addToPointStructure, structure)
), [])

/**
 * The the current Frame of a Timeline.
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

  const timelinePosition = position(
    timeline.playbackOptions,
    typeof at !== 'undefined' ? at : Date.now()
  )

  return timeline.timelineShapes.map(({ shape, timelinePosition: { start, end } }) => {
    if (timelinePosition <= start) {
      return output(shape.keyframes[ 0 ].frameShape, timeline.middleware)
    } else if (timelinePosition >= end) {
      return output(shape.keyframes[ shape.keyframes.length - 1 ].frameShape, timeline.middleware)
    }

    const shapePosition = (timelinePosition - start) / (end - start)

    return frameShapeFromShape({
      shape,
      position: shapePosition,
      middleware: timeline.middleware
    })
  })
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
    return {
      attributes,
      childFrameShapes: childPlainShapeObjects.map(childPlainShapeObject => (
        frameShapeFromPlainShapeObject(childPlainShapeObject)
      ))
    }
  }

  return {
    attributes,
    points: toPoints(plainShapeObject)
  }
}

/**
 * Creates a FrameShape from a Shape given the Position.
 *
 * @param {Object} opts
 * @param {Middleware[]} opts.middleware
 * @param {Position} opts.position
 * @param {Shape} opts.shape
 *
 * @returns {FrameShape}
 *
 * @example
 * frameShapeFromShape({ position: 0.75, shape })
 */
const frameShapeFromShape = ({ middleware = [], position, shape }) => {
  const fromIndex = shape.keyframes.reduce((currentFromIndex, { position: keyframePosition }, i) => (
    position > keyframePosition ? i : currentFromIndex
  ), 0)

  const toIndex = fromIndex + 1

  const from = shape.keyframes[ fromIndex ]
  const to = shape.keyframes[ toIndex ]
  const keyframePosition = (position - from.position) / (to.position - from.position)

  let frameShape = tween(
    from.frameShape,
    to.frameShape,
    to.tween.easing,
    keyframePosition
  )

  to.tween.forces.map(force => {
    frameShape = force(frameShape, keyframePosition)
  })

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
  if (childFrameShapes) {
    return childFrameShapes.map(curveStructure)
  }

  return points.map(({ curve }) => typeof curve !== 'undefined')
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
    return childFrameShapes.map(pointStructure)
  }

  return points.reduce((structure, { moveTo }) => {
    if (moveTo) {
      structure.push(1)
    } else {
      structure[ structure.length - 1 ]++
    }

    return structure
  }, [])
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

  points.map(point => {
    if (point.moveTo) {
      lines.push([ point ])
    } else {
      lines[ lines.length - 1 ].push(point)
    }
  })

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
  const errorMsg = `The tween function's from and to arguments must be of an identicle structure`

  if (Array.isArray(from)) {
    if (__DEV__ && !Array.isArray(to)) {
      throw new TypeError(errorMsg)
    }

    return from.map((f, i) => (tween(f, to[ i ], easing, position)))
  } else if (from !== null && typeof from === 'object') {
    if (to !== null && typeof to !== 'object') {
      throw new TypeError(errorMsg)
    }

    const obj = {}

    Object.keys(from).map(k => {
      obj[ k ] = tween(from[ k ], to[ k ], easing, position)
    })

    return obj
  } else if (typeof from === 'number') {
    if (__DEV__ && typeof to !== 'number') {
      throw new TypeError(errorMsg)
    }

    if (from === to) {
      return from
    }

    return easing(position, from, to, 1)
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

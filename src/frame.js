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
 * @property {Object} styles
 * @property {Object} tween
 * @property {FrameShape[]} childFrameShapes
 */

/**
 * An array of FrameShapes
 *
 * @typedef {FrameShape[]} Frame
 */

/**
 * Creates a FrameShape from a Plain Shape Object.
 *
 * @param {PlainShapeObject} plainShapeObject
 *
 * @returns {FrameShape}
 *
 * @example
 * frameShapeFromPlainShapeObject(circle)
 */
const frameShapeFromPlainShapeObject = ({ shapes: childPlainShapeObjects, ...plainShapeObject }) => {
  const k = {
    points: plainShapeObject.type === 'g'
      ? null
      : toPoints(plainShapeObject),
    styles: {},
    tween: {}
  }

  if (childPlainShapeObjects) {
    k.childFrameShapes = childPlainShapeObjects.map(childPlainShapeObject => (
      frameShapeFromPlainShapeObject(childPlainShapeObject)
    ))
  }

  return k
}

const frame = timeline => {
  return []
}

export { frameShapeFromPlainShapeObject }
export default frame

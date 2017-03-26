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
 * @typedef {Object} KeyframeShape
 *
 * @property {Points} points
 * @property {Object} styles
 * @property {KeyframeShape[]} childKeyframeShapes
 */

/**
 * The data required to render and tween to a shape.
 *
 * @typedef {Object} Keyframe
 *
 * @property {number} position
 * @property {KeyframeShape} keyframeShape
 */

/**
 * Creates a KeyframeShape from a Plain Shape Object.
 *
 * @param {PlainShapeObject} plainShapeObject
 *
 * @returns {KeyframeShape}
 *
 * @example
 * keyframeShape(circle)
 */
const keyframeShape = ({ shapes: childPlainShapeObjects, ...plainShapeObject }) => {
  const k = {
    points: plainShapeObject.type === 'g'
      ? null
      : toPoints(plainShapeObject),
    styles: {}
  }

  if (childPlainShapeObjects) {
    k.childKeyframeShapes = childPlainShapeObjects.map(childPlainShapeObject => (
      keyframeShape(childPlainShapeObject)
    ))
  }

  return k
}

/**
 * Creates an array of Keyframes from an array of
 * Plain Shape Objects.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @returns {Keyframe[]}
 *
 * @example
 * keyframes([ circle, square ])
 */
const keyframes = plainShapeObjects => (
  plainShapeObjects.map((plainShapeObject, i) => ({
    position: 0,
    keyframeShape: keyframeShape(plainShapeObject)
  }))
)

export default keyframes

import { keyframes } from './keyframe'
import { valid } from './plain-shape-object'

/**
 * A sequence of static shapes.
 *
 * @typedef {Object} Shape
 *
 * @property {Keyframe[]} keyframes
 * @property {PlainShapeObject[]} plainShapeObjects
 */

/**
 * Creates a Shape from one or more Plain Shape Object.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @returns {Shape}
 *
 * @example
 * const morph = shape(circle, square)
 */
const shape = (...plainShapeObjects) => {
  if (plainShapeObjects.length === 0) {
    throw new TypeError(
      `The shape function must be passed at least one Plain Shape Object`
    )
  }

  if (valid(...plainShapeObjects)) {
    return {
      keyframes: keyframes(plainShapeObjects),
      plainShapeObjects
    }
  }
}

export default shape

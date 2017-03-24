import { valid } from 'plain-shape-object'

/**
 * An SVG shape as defined by https://github.com/colinmeinke/svg-points.
 *
 * @typedef {Object} PlainShapeObjectCoreProps
 */

/**
 * A three dimensional shape.
 *
 * @typedef {Object} PlainShapeObject
 *
 * @extends PlainShapeObjectCoreProps
 */

/**
 * A four dimensional shape (i.e. includes time).
 *
 * @typedef {Object} Shape
 *
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

  if (valid(plainShapeObjects)) {
    return {
      plainShapeObjects
    }
  }
}

export default shape

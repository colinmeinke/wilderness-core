import { valid as shapeValid } from 'svg-points'

/**
 * An SVG shape as defined by https://github.com/colinmeinke/svg-points.
 *
 * @typedef {Object} PlainShapeObjectCoreProps
 */

/**
 * A static shape.
 *
 * @typedef {Object} PlainShapeObject
 *
 * @extends PlainShapeObjectCoreProps
 */

/**
 * Validates Plain Shape Object Core Props.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @throws {TypeError} Throws if not valid
 *
 * @returns {true}
 *
 * @example
 * if (corePropsValid(circle)) {
 *   console.log('circle has valid Plain Shape Object Core Props')
 * }
 */
const corePropsValid = plainShapeObjects => {
  const errors = []

  plainShapeObjects.map(plainShapeObject => {
    const result = shapeValid(plainShapeObject)

    if (!result.valid) {
      result.errors.map(e => errors.push(e))
    }
  })

  if (errors.length) {
    throw new TypeError(errorMsg(errors))
  }

  return true
}

/**
 * Joins an array of error messages into one error message.
 *
 * @param {string[]} errors
 *
 * @returns {string}
 *
 * @example
 * errorMsg([
 *   'cx prop is required on a ellipse',
 *   'cy prop must be of type number'
 * ])
 */
const errorMsg = errors => (
  `Plain Shape Object props not valid: ${errors.join('. ')}`
)

const manipulationPropsValid = plainShapeObjects => {
  return true
}

/**
 * Creates a Plain Shape Object from a Shape.
 *
 * @param {Shape} shape
 *
 * @returns {PlainShapeObject}
 *
 * @example
 * plainShapeObject(circle)
 */
const plainShapeObject = shape => {
  return {
    type: 'path',
    d: ''
  }
}

const stylePropsValid = plainShapeObjects => {
  return true
}

const tweenPropsValid = plainShapeObjects => {
  return true
}

/**
 * Validates one or more Plain Shape Object.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @throws {TypeError} Throws if not valid
 *
 * @returns {true}
 *
 * @example
 * if (valid(circle)) {
 *   console.log('circle is a valid Plain Shape Object')
 * }
 */
const valid = (...plainShapeObjects) => (
  corePropsValid(plainShapeObjects) &&
  manipulationPropsValid(plainShapeObjects) &&
  stylePropsValid(plainShapeObjects) &&
  tweenPropsValid(plainShapeObjects)
)

export { valid }
export default plainShapeObject

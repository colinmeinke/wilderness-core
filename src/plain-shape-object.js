import { valid as shapeValid } from 'svg-points'

/**
 * An SVG shape as defined by https://github.com/colinmeinke/svg-points.
 *
 * @typedef {Object} PlainShapeObjectCoreProps
 */

/**
 * The tween options to use when transitioning from a previous shape.
 *
 * @typedef {Object} PlainShapeObjectTweenProps
 *
 * @property {number} delay - Milliseconds before the tween starts.
 */

/**
 * A static shape.
 *
 * @typedef {Object} PlainShapeObject
 *
 * @extends PlainShapeObjectCoreProps
 * @extends PlainShapeObjectTweenProps
 * @property {string|number} name
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
 * if (corePropsValid([ circle ])) {
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
 * Validates name props.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @throws {TypeError} Throws if not valid
 *
 * @returns {true}
 *
 * @example
 * if (namePropsValid([ circle ])) {
 *   console.log('circle has a valid name prop')
 * }
 */
const namePropsValid = plainShapeObjects => {
  const errors = []

  plainShapeObjects.map(({ name }) => {
    if (typeof name !== 'undefined' && !(typeof name === 'string' || typeof name === 'number')) {
      errors.push('the name prop must be of type string or number')
    }
  })

  if (errors.length) {
    throw new TypeError(errorMsg(errors))
  }

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

/**
 * Validates Plain Shape Object Tween Props.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @throws {TypeError} Throws if not valid
 *
 * @returns {true}
 *
 * @example
 * if (tweenPropsValid([ circle, square ])) {
 *   console.log('circle and square have valid tween props')
 * }
 */
const tweenPropsValid = plainShapeObjects => {
  const errors = []

  plainShapeObjects.map(({ delay }) => {
    if (typeof delay !== 'undefined' && !(typeof delay === 'number' && delay > 0)) {
      errors.push('the delay prop must be a number greater than 0')
    }
  })

  if (errors.length) {
    throw new TypeError(errorMsg(errors))
  }

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
  namePropsValid(plainShapeObjects) &&
  corePropsValid(plainShapeObjects) &&
  manipulationPropsValid(plainShapeObjects) &&
  stylePropsValid(plainShapeObjects) &&
  tweenPropsValid(plainShapeObjects)
)

export { valid }
export default plainShapeObject

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
 * Validates PlainShapeObjectCoreProps.
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

const transformsPropValid = plainShapeObjects => {
  const errors = []

  plainShapeObjects.map(({ transforms }) => {
    if (typeof transforms !== 'undefined') {
      if (!Array.isArray(transforms)) {
        errors.push('the transforms prop must be of type array')
      }
    }
  })

  if (errors.length) {
    throw new TypeError(errorMsg(errors))
  }

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
 * if (namePropValid([ circle ])) {
 *   console.log('circle has a valid name prop')
 * }
 */
const namePropValid = plainShapeObjects => {
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
 * Creates a PlainShapeObject from a Shape.
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

/**
 * Validates PlainShapeObjectTweenProps.
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

  plainShapeObjects.map(({ delay, duration, easing }) => {
    if (typeof delay !== 'undefined' && !(typeof delay === 'number' && delay > 0)) {
      errors.push('the delay prop must be a number greater than 0')
    }

    if (typeof duration !== 'undefined' && !(typeof duration === 'number' && duration >= 0)) {
      errors.push('the duration prop must be a number greater than or equal to 0')
    }

    if (typeof easing !== 'undefined' && !(typeof easing === 'function' || typeof easing === 'string')) {
      errors.push('the easing prop must be a of type function or string')
    }
  })

  if (errors.length) {
    throw new TypeError(errorMsg(errors))
  }

  return true
}

/**
 * Validates one or more PlainShapeObject.
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
  namePropValid(plainShapeObjects) &&
  corePropsValid(plainShapeObjects) &&
  transformsPropValid(plainShapeObjects) &&
  tweenPropsValid(plainShapeObjects)
)

export { valid }
export default plainShapeObject

/* globals __DEV__ */

import keyframesAndDuration from './keyframe'
import { valid } from './plain-shape-object'

/**
 * A sequence of static shapes.
 *
 * @typedef {Object} Shape
 *
 * @property {Keyframe[]} keyframes
 */

/**
 * An object containing PlainShapeObjects and shape options.
 *
 * @typedef {Object} SortedShapeProps
 *
 * @property {PlainShapeObject[]} plainShapeObjects
 * @property {Object} options
 * @property {(string|number)} options.name
 */

/**
 * Creates a Shape from one or more PlainShapeObject.
 * Optionally can take an options object as the last argument.
 *
 * @param {(PlainShapeObject|Object)[]} props
 *
 * @returns {Shape}
 *
 * @example
 * shape(circle, square)
 */
const shape = (...props) => {
  const { plainShapeObjects, options: { name } } = sort(props)
  const { duration, keyframes } = keyframesAndDuration(plainShapeObjects)

  const s = { duration, keyframes }

  if (typeof name !== 'undefined') {
    s.name = name
  }

  return s
}

/**
 * Sorts an array of props into a PlainShapeObject array and options.
 *
 * @param {(PlainShapeObject|Object)[]} props
 *
 * @returns {SortedShapeProps}
 *
 * @example
 * sort(props)
 */
const sort = props => {
  const plainShapeObjects = props.filter(prop => {
    if (__DEV__ && typeof prop !== 'object') {
      throw new TypeError(`The shape function must only be passed objects`)
    }

    return prop.type
  })

  const options = props.length > 1 && typeof props[ props.length - 1 ].type === 'undefined'
    ? props[ props.length - 1 ]
    : {}

  const sortedProps = { plainShapeObjects, options }

  if (validProps(sortedProps)) {
    return sortedProps
  }
}

/**
 * Validates a PlainShapeObject array and shape options.
 *
 * @param {SortedShapeProps}
 *
 * @throws {TypeError} Throws if not valid
 *
 * @returns {true}
 *
 * @example
 * validProps({ plainShapeObjects, options })
 */
const validProps = ({ plainShapeObjects, options: { name } }) => {
  if (__DEV__ && plainShapeObjects.length === 0) {
    throw new TypeError(
      `The shape function must be passed at least one Plain Shape Object`
    )
  }

  if (__DEV__ && valid(...plainShapeObjects)) {
    if (typeof name !== 'undefined' && (typeof name !== 'string' && typeof name !== 'number')) {
      throw new TypeError(
        `The name option passed to the shape function must be of type string or number`
      )
    }
  }

  return true
}

export default shape

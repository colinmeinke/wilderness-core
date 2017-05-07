/**
 * A naive, but small, clone function.
 *
 * @param {*} value
 *
 * @returns {*}
 *
 * @example
 * clone('hello world')
 */
const clone = value => {
  if (Array.isArray(value)) {
    return value.map(x => clone(x))
  } else if (value !== null && typeof value === 'object') {
    return Object.keys(value).reduce((obj, key) => {
      obj[ key ] = clone(value[ key ])
      return obj
    }, {})
  }

  return value
}

export default clone

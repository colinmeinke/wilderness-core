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
  if (typeof value !== 'object') {
    return value
  } else if (Array.isArray(value)) {
    const arr = []

    for (let i = 0, l = value.length; i < l; i++) {
      arr.push(clone(value[ i ]))
    }

    return arr
  } else if (value !== null) {
    const obj = {}

    for (let key in value) {
      obj[ key ] = clone(value[ key ])
    }

    return obj
  }

  return value
}

export default clone

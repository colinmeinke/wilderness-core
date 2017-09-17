/**
 * A group of functions to transform/untransform a value.
 *
 * @typedef {Object} Middleware
 *
 * @property {string} name - The name of the middleware.
 * @property {function} input - Transform.
 * @property {function} output - Untransform.
 */

/**
 * Run every part of a value through a function.
 *
 * @param {*} value
 * @param {function} func
 *
 * @returns {*}
 *
 * @example
 * apply(2, n => n * 2)
 */
const apply = (value, func) => {
  const v = func(value)

  if (typeof v !== 'object') {
    return v
  } else if (Array.isArray(v)) {
    const arr = []

    for (let i = 0, l = v.length; i < l; i++) {
      arr.push(apply(v[ i ], func))
    }

    return arr
  } else if (v !== null) {
    const obj = {}

    for (let k in v) {
      obj[ k ] = apply(v[ k ], func)
    }

    return obj
  }

  return v
}

/**
 * Runs each Middleware input function in turn on a value.
 *
 * @param {*} value
 * @param {Middleware[]} middleware
 *
 * @returns {*}
 *
 * @example
 * input({ foo: 1, bar: [ 2, 3 ] }, middleware)
 */
const input = (value, middleware) => {
  let v = value

  for (let i = 0, l = middleware.length; i < l; i++) {
    v = apply(v, middleware[ i ].input)
  }

  return v
}

/**
 * Runs each Middleware output function in reverse on a value.
 *
 * @param {*} value
 * @param {Middleware[]} middleware
 *
 * @returns {*}
 *
 * @example
 * output({ foo: 1, bar: [ 2, 3 ] }, middleware)
 */
const output = (value, middleware) => {
  let v = value

  for (let i = middleware.length - 1; i >= 0; i--) {
    v = apply(v, middleware[ i ].output)
  }

  return v
}

export { input, output }

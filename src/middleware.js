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

  if (Array.isArray(v)) {
    return v.map(x => apply(x, func))
  }

  if (v !== null && typeof v === 'object') {
    const obj = {}

    Object.keys(v).map(k => {
      obj[ k ] = apply(v[ k ], func)
    })

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
const input = (value, middleware) => middleware.reduce((v, m) => (
  apply(v, m.input)
), value)

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
const output = (value, middleware) => [ ...middleware ].reverse().reduce((v, m) => (
  apply(v, m.output)
), value)

export { input, output }

/**
 * A tweenable unit.
 *
 * @typedef {Object} Unit
 *
 * @property {string} middleware - The name of this middleware.
 * @property {string} values - The type of color string to output.
 */

const name = 'unit'

const units = [
  'ch',
  'cm',
  'em',
  'ex',
  'in',
  'mm',
  'pc',
  'pt',
  'px',
  'rem',
  'vh',
  'vmax',
  'vmin',
  'vw',
  '%'
]

/**
 * Converts a unit string to a Unit.
 *
 * @param {*} x - A potential unit string.
 *
 * @returns {*}
 *
 * @example
 * input('20px')
 */
const input = x => {
  if (typeof x === 'string') {
    const parts = x.split(' ')
    const values = []

    for (let i = 0, l = parts.length; i < l; i++) {
      const part = parts[ i ]
      const number = parseFloat(part)
      const unit = part.replace(number, '')

      if (!isNaN(number) && (unit === '' || units.indexOf(unit) !== -1)) {
        values.push([ number, unit ])
      } else {
        values.push(part)
      }
    }

    if (values.toString() !== parts.toString()) {
      return { middleware: name, values }
    }
  }

  return x
}

/**
 * Converts a Unit to a unit string.
 *
 * @param {*} x - A potential Unit.
 *
 * @returns {*}
 *
 * @example
 * output(unit)
 */
const output = x => {
  if (typeof x === 'object' && x.middleware === name) {
    const values = x.values
    const result = []

    for (let i = 0, l = values.length; i < l; i++) {
      result.push(values[ i ].join(''))
    }

    return result.join(' ')
  }

  return x
}

export default { name, input, output }

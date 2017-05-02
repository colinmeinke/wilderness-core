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

    const values = parts.map(part => {
      const number = parseFloat(part)
      const unit = part.replace(number, '')

      if (!isNaN(number) && (unit === '' || units.indexOf(unit) !== -1)) {
        return [ number, unit ]
      }

      return part
    })

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
    return x.values.map(a => a.join('')).join(' ')
  }

  return x
}

export default { name, input, output }

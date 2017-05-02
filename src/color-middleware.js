/**
 * A tweenable color.
 *
 * @typedef {Object} Color
 *
 * @property {string} middleware - The name of this middleware.
 * @property {string} type - The type of color string to output.
 * @property {number} r - The hexadecimal red value.
 * @property {number} g - The hexadecimal green value.
 * @property {number} b - The hexadecimal blue value.
 * @property {number} a - The alpha value.
 */

const name = 'color'

/**
 * Converts a color string to a Color.
 *
 * @param {*} x - A potential color string.
 *
 * @returns {*}
 *
 * @example
 * input('#FFFFFF')
 */
const input = x => {
  if (typeof x === 'string') {
    if (hex(x)) {
      return hexToColor(x)
    } else if (rgb(x)) {
      return rgbToColor(x)
    } else if (rgba(x)) {
      return rgbaToColor(x)
    }
  }

  return x
}

/**
 * Converts a Color to a color string.
 *
 * @param {*} x - A potential Color.
 *
 * @returns {*}
 *
 * @example
 * output(color)
 */
const output = x => {
  if (typeof x === 'object' && x.middleware === name) {
    switch (x.type) {
      case 'rgba':
        return colorToRgba(x)
      case 'rgb':
        return colorToRgb(x)
      case 'hex':
        return colorToHex(x)
    }
  }

  return x
}

/**
 * Is string a hex color?
 *
 * @param {string} str - A potential hex color.
 *
 * @returns {boolean}
 *
 * @example
 * hex('#FFFFFF')
 */
const hex = str => str.match(/^#(?:[0-9a-f]{3}){1,2}$/i) !== null

/**
 * Is string a rgba color?
 *
 * @param {string} str - A potential rgba color.
 *
 * @returns {boolean}
 *
 * @example
 * rgba('rgba(255,255,255,1)')
 */
const rgba = str => str.startsWith('rgba(')

/**
 * Is string a rgb color?
 *
 * @param {string} str - A potential rgb color.
 *
 * @returns {boolean}
 *
 * @example
 * rgb('rgb(255,255,255)')
 */
const rgb = str => str.startsWith('rgb(')

/**
 * Converts a hex string to a Color.
 *
 * @param {string} hex - A hex color.
 *
 * @returns {Color}
 *
 * @example
 * hexToColor('#FFFFFF')
 */
const hexToColor = hex => {
  let x = hex.replace('#', '')

  if (x.length === 3) {
    x = x.split('').map(v => `${v}${v}`).join('')
  }

  return {
    middleware: name,
    type: 'hex',
    r: parseInt(x.slice(0, 2), 16),
    g: parseInt(x.slice(2, 4), 16),
    b: parseInt(x.slice(4, 6), 16),
    a: 1
  }
}

/**
 * Converts a rgb string to a Color.
 *
 * @param {string} rgb - A rgb color.
 *
 * @returns {Color}
 *
 * @example
 * rgbToColor('rgb(255,255,255)')
 */
const rgbToColor = rgb => {
  const x = rgb.replace(/\s/g, '')

  const [ r, g, b ] = x.substring(4, x.length - 1).split(',')

  return {
    middleware: name,
    type: 'rgb',
    r: parseFloat(r),
    g: parseFloat(g),
    b: parseFloat(b),
    a: 1
  }
}

/**
 * Converts a rgba string to a Color.
 *
 * @param {string} rgba - A rgba color.
 *
 * @returns {Color}
 *
 * @example
 * rgbaToColor('rgba(255,255,255,1)')
 */
const rgbaToColor = rgba => {
  const x = rgba.replace(/\s/g, '')

  const [ r, g, b, a ] = x.substring(5, x.length - 1).split(',')

  return {
    middleware: 'color',
    type: 'rgba',
    r: parseFloat(r),
    g: parseFloat(g),
    b: parseFloat(b),
    a: parseFloat(a)
  }
}

/**
 * Converts a Color to a hex color string.
 *
 * @param {Color} color
 *
 * @returns {string}
 *
 * @example
 * colorToHex(color)
 */
const colorToHex = color => {
  let r = Math.ceil(limit(color.r, 0, 255)).toString(16)
  let g = Math.ceil(limit(color.g, 0, 255)).toString(16)
  let b = Math.ceil(limit(color.b, 0, 255)).toString(16)

  r = r.length === 1 ? `0${r}` : r
  g = g.length === 1 ? `0${g}` : g
  b = b.length === 1 ? `0${b}` : b

  return `#${r}${g}${b}`
}

/**
 * Converts a Color to a rgb color string.
 *
 * @param {Color} color
 *
 * @returns {string}
 *
 * @example
 * colorToRgb(obj)
 */
const colorToRgb = ({ r, g, b }) => `rgb(${limit(r, 0, 255)},${limit(g, 0, 255)},${limit(b, 0, 255)})`

/**
 * Converts a Color to a rgba color string.
 *
 * @param {Color} color
 *
 * @returns {string}
 *
 * @example
 * colorToRgba(color)
 */
const colorToRgba = ({ r, g, b, a }) => `rgba(${limit(r, 0, 255)},${limit(g, 0, 255)},${limit(b, 0, 255)},${limit(a, 0, 1)})`

/**
 * Find the closest number within limits.
 *
 * @param {number} num - The desired number.
 * @param {number} min - The minimum returned number.
 * @param {number} max - the maximum returned number.
 *
 * @returns {number}
 *
 * @example
 * limit(-1, 2, 5)
 */
const limit = (num, min, max) => Math.max(min, Math.min(max, num))

export default { name, input, output }

/**
 * A tweenable color.
 *
 * @typedef {Object} Color
 *
 * @property {string} middleware - The name of this middleware.
 * @property {number} r - The hexadecimal red value.
 * @property {number} g - The hexadecimal green value.
 * @property {number} b - The hexadecimal blue value.
 * @property {number} a - The alpha value.
 */

const name = 'color'

const htmlColors = {
  'aliceblue': '#F0F8FF',
  'antiquewhite': '#FAEBD7',
  'aqua': '#00FFFF',
  'aquamarine': '#7FFFD4',
  'azure': '#F0FFFF',
  'beige': '#F5F5DC',
  'bisque': '#FFE4C4',
  'black': '#000000',
  'blanchedalmond': '#FFEBCD',
  'blue': '#0000FF',
  'blueviolet': '#8A2BE2',
  'brown': '#A52A2A',
  'burlywood': '#DEB887',
  'cadetblue': '#5F9EA0',
  'chartreuse': '#7FFF00',
  'chocolate': '#D2691E',
  'coral': '#FF7F50',
  'cornflowerblue': '#6495ED',
  'cornsilk': '#FFF8DC',
  'crimson': '#DC143C',
  'cyan': '#00FFFF',
  'darkblue': '#00008B',
  'darkcyan': '#008B8B',
  'darkgoldenrod': '#B8860B',
  'darkgray': '#A9A9A9',
  'darkgreen': '#006400',
  'darkgrey': '#A9A9A9',
  'darkkhaki': '#BDB76B',
  'darkmagenta': '#8B008B',
  'darkolivegreen': '#556B2F',
  'darkorange': '#FF8C00',
  'darkorchid': '#9932CC',
  'darkred': '#8B0000',
  'darksalmon': '#E9967A',
  'darkseagreen': '#8FBC8F',
  'darkslateblue': '#483D8B',
  'darkslategray': '#2F4F4F',
  'darkslategrey': '#2F4F4F',
  'darkturquoise': '#00CED1',
  'darkviolet': '#9400D3',
  'deeppink': '#FF1493',
  'deepskyblue': '#00BFFF',
  'dimgray': '#696969',
  'dimgrey': '#696969',
  'dodgerblue': '#1E90FF',
  'firebrick': '#B22222',
  'floralwhite': '#FFFAF0',
  'forestgreen': '#228B22',
  'fuchsia': '#FF00FF',
  'gainsboro': '#DCDCDC',
  'ghostwhite': '#F8F8FF',
  'gold': '#FFD700',
  'goldenrod': '#DAA520',
  'gray': '#808080',
  'green': '#008000',
  'greenyellow': '#ADFF2F',
  'grey': '#808080',
  'honeydew': '#F0FFF0',
  'hotpink': '#FF69B4',
  'indianred': '#CD5C5C',
  'indigo': '#4B0082',
  'ivory': '#FFFFF0',
  'khaki': '#F0E68C',
  'lavender': '#E6E6FA',
  'lavenderblush': '#FFF0F5',
  'lawngreen': '#7CFC00',
  'lemonchiffon': '#FFFACD',
  'lightblue': '#ADD8E6',
  'lightcoral': '#F08080',
  'lightcyan': '#E0FFFF',
  'lightgoldenrodyellow': '#FAFAD2',
  'lightgray': '#D3D3D3',
  'lightgreen': '#90EE90',
  'lightgrey': '#D3D3D3',
  'lightpink': '#FFB6C1',
  'lightsalmon': '#FFA07A',
  'lightseagreen': '#20B2AA',
  'lightskyblue': '#87CEFA',
  'lightslategray': '#778899',
  'lightslategrey': '#778899',
  'lightsteelblue': '#B0C4DE',
  'lightyellow': '#FFFFE0',
  'lime': '#00FF00',
  'limegreen': '#32CD32',
  'linen': '#FAF0E6',
  'magenta': '#FF00FF',
  'maroon': '#800000',
  'mediumaquamarine': '#66CDAA',
  'mediumblue': '#0000CD',
  'mediumorchid': '#BA55D3',
  'mediumpurple': '#9370DB',
  'mediumseagreen': '#3CB371',
  'mediumslateblue': '#7B68EE',
  'mediumspringgreen': '#00FA9A',
  'mediumturquoise': '#48D1CC',
  'mediumvioletred': '#C71585',
  'midnightblue': '#191970',
  'mintcream': '#F5FFFA',
  'mistyrose': '#FFE4E1',
  'moccasin': '#FFE4B5',
  'navajowhite': '#FFDEAD',
  'navy': '#000080',
  'oldlace': '#FDF5E6',
  'olive': '#808000',
  'olivedrab': '#6B8E23',
  'orange': '#FFA500',
  'orangered': '#FF4500',
  'orchid': '#DA70D6',
  'palegoldenrod': '#EEE8AA',
  'palegreen': '#98FB98',
  'paleturquoise': '#AFEEEE',
  'palevioletred': '#DB7093',
  'papayawhip': '#FFEFD5',
  'peachpuff': '#FFDAB9',
  'peru': '#CD853F',
  'pink': '#FFC0CB',
  'plum': '#DDA0DD',
  'powderblue': '#B0E0E6',
  'purple': '#800080',
  'rebeccapurple': '#663399',
  'red': '#FF0000',
  'rosybrown': '#BC8F8F',
  'royalblue': '#4169E1',
  'saddlebrown': '#8B4513',
  'salmon': '#FA8072',
  'sandybrown': '#F4A460',
  'seagreen': '#2E8B57',
  'seashell': '#FFF5EE',
  'sienna': '#A0522D',
  'silver': '#C0C0C0',
  'skyblue': '#87CEEB',
  'slateblue': '#6A5ACD',
  'slategray': '#708090',
  'slategrey': '#708090',
  'snow': '#FFFAFA',
  'springgreen': '#00FF7F',
  'steelblue': '#4682B4',
  'tan': '#D2B48C',
  'teal': '#008080',
  'thistle': '#D8BFD8',
  'tomato': '#FF6347',
  'turquoise': '#40E0D0',
  'violet': '#EE82EE',
  'wheat': '#F5DEB3',
  'white': '#FFFFFF',
  'whitesmoke': '#F5F5F5',
  'yellow': '#FFFF00',
  'yellowgreen': '#9ACD32'
}

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
    } else if (html(x)) {
      return htmlToColor(x)
    }
  }

  return x
}

/**
 * Converts a Color to a rgba color string.
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
    return colorToRgba(x)
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
 * Is string a html color?
 *
 * @param {string} str - A potential html color.
 *
 * @returns {boolean}
 *
 * @example
 * html('limegreen')
 */
const html = str => Object.keys(htmlColors).indexOf(str) !== -1

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
    r: parseFloat(r),
    g: parseFloat(g),
    b: parseFloat(b),
    a: parseFloat(a)
  }
}

/**
 * Converts a html string to a Color.
 *
 * @param {string} html - An html color.
 *
 * @returns {Color}
 *
 * @example
 * htmlToColor('limegreen')
 */
const htmlToColor = html => hexToColor(htmlColors[ html ])

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
const colorToRgba = ({ r, g, b, a }) => `rgba(${parseInt(limit(r, 0, 255), 10)},${parseInt(limit(g, 0, 255), 10)},${parseInt(limit(b, 0, 255), 10)},${limit(a, 0, 1)})`

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

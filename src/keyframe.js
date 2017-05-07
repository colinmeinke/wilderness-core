import config from './config'
import { frameShapeFromPlainShapeObject } from './frame'
import transform from './transform'
import tweenFunctions from 'tween-functions'

/**
 * A format to represent the structure of a FrameShape.
 * An array represents a shape. A number represents a line.
 * An array that has nested arrays represents a group of shapes.
 *
 * @typedef {(number|number[])[]} Structure
 */

/**
 * The data required to render and tween to a shape.
 *
 * @typedef {Object} Keyframe
 *
 * @property {(string|number)} name - A unique reference.
 * @property {Position} position
 * @property {FrameShape} frameShape
 * @property {Object} tween
 */

/**
 * A Keyframe array and their total duration.
 *
 * @typedef {Object} KeyframesAndDuration
 *
 * @property {Keyframe[]} keyframes
 * @property {number} duration
 */

/**
 * Adds a value to a Stucture at the defined position.
 *
 * @param {Structure} s
 * @param {(number|number[])} v - Value to add to Structure.
 * @param {number} i - Position to add value at.
 *
 * @example
 * addToStructure([], 9, 0)
 */
const addToStructure = (s, v, i) => {
  if (Array.isArray(v)) {
    if (!Array.isArray(s[ i ])) {
      s[ i ] = [ s[ i ] ]
    }

    v.reduce(addToStructure, s[ i ])
  } else {
    s[ i ] = Math.max(s[ i ] || 0, v)
  }

  return s
}

/**
 * Creates a common Structure from an array of Stuctures.
 *
 * @param {Structure[]} structures
 *
 * @returns {Structure}
 *
 * @example
 * commonStructure(structures)
 */
const commonStructure = structures => structures.reduce((commonStructure, s) => (
  s.reduce(addToStructure, commonStructure)
), [])

/**
 * An easing function.
 *
 * @param {(function|string)} easing - An easing function or the name of an easing function from https://github.com/chenglou/tween-functions.
 *
 * @returns {function}
 *
 * @example
 * easingFunc('easeInOutQuad')
 */
const easingFunction = (easing = config.defaults.keyframe.easing) => {
  switch (typeof easing) {
    case 'string':
      if (tweenFunctions[ easing ]) {
        return tweenFunctions[ easing ]
      }

      throw new TypeError(
        `Easing must match one of the options defined by https://github.com/chenglou/tween-functions`
      )

    case 'function':
      return easing

    default:
      throw new TypeError(`Easing must be of type function or string`)
  }
}

/**
 * Adds Points to FrameShapes so each Keyframe has an equal number
 * of Points and is therefore tweenable.
 *
 * @param {Keyframe[]} keyframes
 *
 * @returns {Keyframe[]}
 *
 * @example
 * equaliseKeyframes(keyframes)
 */
const equaliseKeyframes = keyframes => {
  const structures = keyframes.map(({ frameShape }) => structure(frameShape))
  const s = commonStructure(structures)

  return keyframes
}

/**
 * Creates a Keyframe array from a PlainShapeObject array.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @returns {KeyframesAndDuration}
 *
 * @example
 * keyframes([ circle, square ])
 */
const keyframesAndDuration = plainShapeObjects => {
  const keyframes = []

  plainShapeObjects.map(({
    delay,
    duration,
    easing,
    name,
    transforms = [],
    ...plainShapeObject
  }, i) => {
    const frameShape = frameShapeFromPlainShapeObject(plainShapeObject)

    const keyframe = {
      name: typeof name !== 'undefined' ? name : i,
      frameShape: transform(frameShape, transforms)
    }

    if (i > 0) {
      keyframe.tween = {
        duration: typeof duration !== 'undefined'
          ? duration
          : config.defaults.keyframe.duration,
        easing: easingFunction(easing)
      }

      if (delay) {
        const previousKeyframe = keyframes[ keyframes.length - 1 ]

        const delayKeyframe = {
          ...previousKeyframe,
          name: `${previousKeyframe.name}.delay`,
          tween: { duration: delay }
        }

        keyframes.push(delayKeyframe)
      }
    }

    keyframes.push(keyframe)
  })

  const equalisedKeyframes = equaliseKeyframes(keyframes)
  const totalDuration = keyframesTotalDuration(keyframes)

  return {
    duration: totalDuration,
    keyframes: positionKeyframes(equalisedKeyframes, totalDuration)
  }
}

/**
 * Adds the position prop to each Keyframe in a Keyframe array.
 *
 * @param {Keyframe[]} k
 * @param {number} totalDuration
 *
 * @returns {Keyframe[]}
 *
 * @example
 * positionKeyframes(keyframes)
 */
const positionKeyframes = (k, totalDuration) => {
  let durationAtKeyframe = 0

  return k.map(keyframe => {
    const { tween: { duration = 0 } = {} } = keyframe

    durationAtKeyframe += duration

    return {
      ...keyframe,
      position: durationAtKeyframe === 0
        ? 0
        : durationAtKeyframe / totalDuration
    }
  })
}

/**
 * Adds the tween duration of a Keyframe array.
 *
 * @param {Keyframe[]} k
 *
 * @returns {number}
 *
 * @example
 * keyframesTotalDuration(keyframes)
 */
const keyframesTotalDuration = k => k.reduce((
  currentDuration,
  { tween: { duration = 0 } = {} }
) => (currentDuration += duration), 0)

/**
 * Creates a Structure from a FrameShape.
 *
 * @param {FrameShape} frameShape
 *
 * @returns {Structure}
 *
 * @example
 * structure(frameShape)
 */
const structure = ({ points, childFrameShapes }) => {
  if (childFrameShapes) {
    return childFrameShapes.map(structure)
  }

  return points.reduce((s, { moveTo }) => {
    if (moveTo) {
      s.push(1)
    } else {
      s[ s.length - 1 ]++
    }

    return s
  }, [])
}

export { commonStructure, structure }
export default keyframesAndDuration

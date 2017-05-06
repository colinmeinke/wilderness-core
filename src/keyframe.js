import config from './config'
import { frameShapeFromPlainShapeObject } from './frame'
import transform from './transform'
import tweenFunctions from 'tween-functions'

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
 * @property {Keyframe[]} keyframes
 *
 * @returns {Keyframe[]}
 *
 * @example
 * equaliseKeyframes(keyframes)
 */
const equaliseKeyframes = keyframes => {
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

export default keyframesAndDuration

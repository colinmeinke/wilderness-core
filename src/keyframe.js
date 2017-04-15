import config from './config'
import { frameShapeFromPlainShapeObject } from './frame'
import tweenFunctions from 'tween-functions'

/**
 * The data required to render and tween to a shape.
 *
 * @typedef {Object} Keyframe
 *
 * @property {(string|number)} name - A unique reference.
 * @property {number} position - A number between 0 and 1 (inclusive).
 * @property {FrameShape} frameShape
 * @property {Object} tween
 */

/**
 * A set of keyframes and their total duration.
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
 * Creates an array of Keyframes from an array of Plain Shape Objects.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @returns {KeyframesAndDuration}
 *
 * @example
 * keyframes([ circle, square ])
 */
const keyframesAndDuration = plainShapeObjects => {
  const k = []

  plainShapeObjects.map(({
    delay,
    duration,
    easing,
    name,
    ...plainShapeObject
  }, i) => {
    const keyframe = {
      name: typeof name !== 'undefined' ? name : i,
      frameShape: frameShapeFromPlainShapeObject(plainShapeObject)
    }

    if (i > 0) {
      keyframe.tween = {
        duration: typeof duration !== 'undefined'
          ? duration
          : config.defaults.keyframe.duration,
        easing: easingFunction(easing)
      }

      if (delay) {
        const previousKeyframe = k[ k.length - 1 ]

        const delayKeyframe = {
          ...previousKeyframe,
          name: `${previousKeyframe.name}.delay`,
          tween: { duration: delay }
        }

        k.push(delayKeyframe)
      }
    }

    k.push(keyframe)
  })

  const totalDuration = keyframesTotalDuration(k)

  return {
    duration: totalDuration,
    keyframes: positionedKeyframes(k, totalDuration)
  }
}

/**
 * Adds the position prop to each Keyframe in an array of Keyframes.
 *
 * @param {Keyframe[]} k
 * @param {number} totalDuration
 *
 * @returns {Keyframe[]}
 *
 * @example
 * positionedKeyframes(keyframes)
 */
const positionedKeyframes = (k, totalDuration) => {
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
 * Adds the tween duration of an array of Keyframes.
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

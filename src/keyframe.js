import {
  applyCurveStructure,
  applyPointStructure,
  commonCurveStructure,
  commonPointStructure,
  curveStructure,
  frameShapeFromPlainShapeObject,
  pointStructure
} from './frame'
import config from './config'
import easingFunction from './easing-function'
import transform from './transform'

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
 * Converts Keyframes so each has the same
 * PointStructure and CurveStructure.
 *
 * @param {Keyframe[]} keyframes
 *
 * @returns {Keyframe[]}
 *
 * @example
 * equaliseKeyframes(keyframes)
 */
const equaliseKeyframes = keyframes => {
  const pointStrucs = []
  const k = []
  const curveStrucs = []
  const result = []

  for (let i = 0, l = keyframes.length; i < l; i++) {
    pointStrucs.push(pointStructure(keyframes[ i ].frameShape))
  }

  const pointStruc = commonPointStructure(pointStrucs)

  for (let i = 0, l = keyframes.length; i < l; i++) {
    const keyframe = keyframes[ i ]
    keyframe.frameShape = applyPointStructure(keyframe.frameShape, pointStruc)
    k.push(keyframe)
  }

  for (let i = 0, l = k.length; i < l; i++) {
    curveStrucs.push(curveStructure(k[ i ].frameShape))
  }

  const curveStruc = commonCurveStructure(curveStrucs)

  for (let i = 0, l = k.length; i < l; i++) {
    const keyframe = k[ i ]
    keyframe.frameShape = applyCurveStructure(keyframe.frameShape, curveStruc)
    result.push(keyframe)
  }

  return result
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

  for (let i = 0, l = plainShapeObjects.length; i < l; i++) {
    const {
      delay,
      duration,
      easing,
      forces = [],
      name,
      transforms = [],
      ...plainShapeObject
    } = plainShapeObjects[ i ]

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
        easing: easingFunction(easing || config.defaults.keyframe.easing),
        forces
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
  }

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
 * @param {Keyframe[]} keyframes
 * @param {number} totalDuration
 *
 * @returns {Keyframe[]}
 *
 * @example
 * positionKeyframes(keyframes)
 */
const positionKeyframes = (keyframes, totalDuration) => {
  const k = []

  let durationAtKeyframe = 0

  for (let i = 0, l = keyframes.length; i < l; i++) {
    const keyframe = keyframes[ i ]
    const { tween: { duration = 0 } = {} } = keyframe

    durationAtKeyframe += duration

    k.push({
      ...keyframe,
      position: durationAtKeyframe === 0
        ? 0
        : durationAtKeyframe / totalDuration
    })
  }

  return k
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
const keyframesTotalDuration = k => {
  let currentDuration = 0

  for (let i = 0, l = k.length; i < l; i++) {
    const { tween: { duration = 0 } = {} } = k[ i ]
    currentDuration += duration
  }

  return currentDuration
}

export default keyframesAndDuration

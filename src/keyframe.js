import { frameShapeFromPlainShapeObject } from './frame'

/**
 * The data required to render and tween to a shape.
 *
 * @typedef {Object} Keyframe
 *
 * @property {string|number} name
 * @property {number} position - a number between 0 and 1 (inclusive)
 * @property {FrameShape} frameShape
 * @property {Object} tween
 */

/**
 * Creates an array of Keyframes from an array of
 * Plain Shape Objects.
 *
 * @param {PlainShapeObject[]} plainShapeObjects
 *
 * @returns {Keyframe[]}
 *
 * @example
 * keyframes([ circle, square ])
 */
const keyframes = plainShapeObjects => {
  const k = []

  plainShapeObjects.map(({ delay, duration, name, ...plainShapeObject }, i) => {
    const keyframe = {
      name: typeof name !== 'undefined' ? name : i,
      frameShape: frameShapeFromPlainShapeObject(plainShapeObject)
    }

    if (i > 0) {
      keyframe.tween = {
        duration: typeof duration !== 'undefined' ? duration : 200
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

  return positionedKeyframes(k)
}

/**
 * Adds the position prop to each Keyframe in an
 * array of Keyframes.
 *
 * @param {Keyframe[]} k
 *
 * @returns {Keyframe[]}
 *
 * @example
 * positionedKeyframes(keyframes)
 */
const positionedKeyframes = k => {
  const totalDuration = keyframesTotalDuration(k)

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

export default keyframes

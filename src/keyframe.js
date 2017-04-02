import { frameShapeFromPlainShapeObject } from './frame'

/**
 * The data required to render and tween to a shape.
 *
 * @typedef {Object} Keyframe
 *
 * @property {string|number} name
 * @property {number} position
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

  plainShapeObjects.map(({ name, ...plainShapeObject }, i) => {
    const keyframe = {
      name: typeof name !== 'undefined' ? name : i,
      position: 0,
      frameShape: frameShapeFromPlainShapeObject(plainShapeObject)
    }

    if (i > 0) {
      keyframe.tween = {}

      if (plainShapeObject.delay) {
        const previousKeyframe = k[ k.length - 1 ]

        const delayKeyframe = {
          ...previousKeyframe,
          name: `${previousKeyframe.name}.delay`,
          tween: { duration: plainShapeObject.delay }
        }

        k.push(delayKeyframe)
      }
    }

    k.push(keyframe)
  })

  return k
}

export default keyframes

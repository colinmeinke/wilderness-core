import { frameShapeFromPlainShapeObject } from './frame'

/**
 * The data required to render and tween to a shape.
 *
 * @typedef {Object} Keyframe
 *
 * @property {} name
 * @property {number} position
 * @property {FrameShape} frameShape
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
const keyframes = plainShapeObjects => (
  plainShapeObjects.map(({ name, ...plainShapeObject }, i) => ({
    name: typeof name !== 'undefined' ? name : i,
    position: 0,
    frameShape: frameShapeFromPlainShapeObject(plainShapeObject)
  }))
)

export default keyframes

import { toPoints } from 'svg-points'

/**
 * Shape data as specified by the
 * {@link https://github.com/colinmeinke/points Points spec}.
 *
 * @typedef {Object[]} Points
 */

/**
 * The data required to render a shape.
 *
 * @typedef {Object} FrameShape
 *
 * @property {Points} points
 * @property {Object} styles
 * @property {FrameShape[]} childFrameShapes
 */

/**
 * An array of FrameShapes
 *
 * @typedef {FrameShape[]} Frame
 */

/**
 * Creates a FrameShape from a Plain Shape Object.
 *
 * @param {PlainShapeObject} plainShapeObject
 *
 * @returns {FrameShape}
 *
 * @example
 * frameShapeFromPlainShapeObject(circle)
 */
const frameShapeFromPlainShapeObject = ({ shapes: childPlainShapeObjects, ...plainShapeObject }) => {
  const k = {
    styles: {}
  }

  if (plainShapeObject.type !== 'g') {
    k.points = toPoints(plainShapeObject)
  } else if (childPlainShapeObjects) {
    k.childFrameShapes = childPlainShapeObjects.map(childPlainShapeObject => (
      frameShapeFromPlainShapeObject(childPlainShapeObject)
    ))
  }

  return k
}

/**
 * Calculates the the current Frame of a Timeline
 *
 * @param {Timeline} timeline
 * @param {number} [at]
 *
 * @returns {Frame}
 *
 * @example
 * frame(timeline)
 */
const frame = (timeline, at) => {
  if (typeof timeline !== 'object' || !timeline.timelineShapes || !timeline.playbackOptions) {
    throw new TypeError(`The frame function's first argument must be a Timeline`)
  }

  if (typeof at !== 'undefined' && typeof at !== 'number') {
    throw new TypeError(`The frame function's second argument must be of type number`)
  }

  at = typeof at !== 'undefined' ? at : Date.now()

  return []
}

export { frameShapeFromPlainShapeObject }
export default frame

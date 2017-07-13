import config from './config'
import easingFunction from './easing-function'
import { offset, position, rotate } from 'points'
import { toPoints } from 'svg-points'
import { flattenPoints, pointsToFrameShape, transformPoints } from './transform'

/**
 * Applies a motion path's offset and rotation to a FrameShape.
 *
 * @param {Object} opts
 * @param {number} opts.angle - The angle to rotate the FrameShape
 * @param {FrameShape} opts.frameShape
 * @param {number} opts.x - The value to offset the FrameShape on the x axis
 * @param {number} opts.x - The value to offset the FrameShape on the x axis
 *
 * @returns {FrameShape}
 *
 * @example
 * applyMotionPath({ angle, frameShape, x, y })
 */
const applyMotionPath = ({ angle, frameShape, x, y }) => {
  const { points, pointsMap } = flattenPoints(frameShape)
  const offsetPoints = offset(points, x, y)
  const rotatedPoints = angle ? rotate(offsetPoints, angle) : offsetPoints

  return pointsToFrameShape({
    frameShape,
    points: rotatedPoints,
    pointsMap
  })
}

/**
 * Creates a motion path force function from a PlainShapeObject.
 *
 * @param {PlainShapeObject} plainShapeObject
 *
 * @returns {function}
 *
 * @example
 * motionPath({ ...plainShapeObject, accuracy: 0.1, rotate: true })
 */
const motionPath = ({
  accuracy = 1,
  easing: motionPathEasing = config.defaults.motionPath.easing,
  rotate: r = false,
  transforms = [],
  ...plainShapeObject
}) => {
  // @todo add validation (inc. error on group shape)
  // @todo add tests (inc. motion path transform)

  const motionPathPoints = transformPoints(toPoints(plainShapeObject), transforms)
  const easing = easingFunction(motionPathEasing)

  return (frameShape, framePosition) => {
    const motionPathPosition = easing(framePosition, 0, 1, 1)
    const { angle, x, y } = position(motionPathPoints, motionPathPosition, accuracy)

    if (!x && !y) {
      return frameShape
    }

    return applyMotionPath({
      angle: typeof r === 'number'
        ? (angle + r) % 360
        : r === true ? angle : 0,
      frameShape,
      x,
      y
    })
  }
}

export default motionPath

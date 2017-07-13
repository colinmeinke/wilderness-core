import config from './config'
import easingFunction from './easing-function'
import { offset, position, rotate } from 'points'
import { toPoints } from 'svg-points'
import { flattenPoints, pointsToFrameShape, transformPoints } from './transform'

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

const motionPath = ({
  accuracy = 1,
  easing: motionPathEasing = config.defaults.motionPath.easing,
  rotate: r = false,
  transforms = [],
  ...plainShapeObject
}) => {
  // @todo add code comments
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

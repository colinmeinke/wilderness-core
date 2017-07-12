import config from './config'
import easingFunction from './easing-function'
import { offset, position, rotate } from 'points'
import { toPoints } from 'svg-points'

const applyMotionPath = ({ angle, frameShape, x, y }) => {
  if (frameShape.childFrameShapes) {
    return {
      ...frameShape,
      childFrameShapes: frameShape.childFrameShapes.map(childFrameShape => (
        applyMotionPath({ angle, frameShape: childFrameShape, x, y })
      ))
    }
  }

  const offsetPoints = offset(frameShape.points, x, y)
  const points = angle ? rotate(offsetPoints, angle) : offsetPoints

  return { ...frameShape, points }
}

const motionPath = ({
  accuracy = 1,
  easing: motionPathEasing = config.defaults.motionPath.easing,
  rotate: r = false,
  ...plainShapeObject
}) => {
  // @todo apply transforms to motionPath shape
  // @todo add code comments
  // @todo add validation (inc. error on group shape)
  // @todo add tests

  const motionPathPoints = toPoints(plainShapeObject)
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

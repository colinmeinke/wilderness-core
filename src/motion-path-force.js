import config from './config'
import easingFunction from './easing-function'
import { offset, position } from 'points'
import { toPoints } from 'svg-points'

const motionPath = ({
  accuracy = 1,
  easing: motionPathEasing = config.defaults.motionPath.easing,
  rotate = false,
  ...plainShapeObject
}) => {
  // @todo handle angle
  // @todo add code comments
  // @todo add validation
  // @todo add tests

  const points = toPoints(plainShapeObject)
  const easing = easingFunction(motionPathEasing)

  return (frameShape, framePosition) => {
    const motionPathPosition = easing(framePosition, 0, 1, 1)
    const { angle, x, y } = position(points, motionPathPosition, accuracy)

    return { ...frameShape, points: offset(frameShape.points, x, y) }
  }
}

export default motionPath

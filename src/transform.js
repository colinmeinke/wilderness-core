import * as transformFunctions from 'points'

/**
 * A WeakMap where the key is a FrameShape and the value is
 * the index of the associated points within an array of Points.
 *
 * @typedef {weakmap} PointsMap
 */

/**
 * Applies a transform to a FrameShape.
 *
 * @param {FrameShape} frameShape
 * @param {(string|number)[]} transform
 *
 * @return {FrameShape}
 *
 * @example
 * transform(frameShape, [ 'rotate', 45 ])
 */
const apply = (frameShape, [ name, ...args ]) => {
  const { points, pointsMap } = flattenPoints(frameShape)
  const transformedPoints = transformFunctions[ name ](points, ...args)

  return pointsToFrameShape({
    frameShape,
    points: transformedPoints,
    pointsMap
  })
}

/**
 * Creates an array of Points from a FrameShape.
 *
 * @param {FrameShape} frameShape
 * @param {Points[]} [points=[]]
 * @param {PointsMap} [pointsMap=new WeakMap()]
 *
 * @return {Object}
 *
 * @example
 * flattenPoints(frameShape)
 */
const flattenPoints = (frameShape, points = [], pointsMap = new WeakMap()) => {
  if (frameShape.childFrameShapes) {
    frameShape.childFrameShapes.map(childFrameShape => {
      flattenPoints(childFrameShape, points, pointsMap)
    })
  } else {
    pointsMap.set(frameShape, points.length)
    points.push(frameShape.points)
  }

  return { points, pointsMap }
}

/**
 * Applies an array of Points to a FrameShape using a PointsMap
 *
 * @param {Object} opts
 * @param {FrameShape} opts.frameShape
 * @param {Points[]} opts.points
 * @param {PointsMap} pointsMap
 *
 */
const pointsToFrameShape = ({ frameShape, points, pointsMap }) => {
  if (frameShape.points) {
    frameShape.points = points[ pointsMap.get(frameShape) ]
  }

  if (frameShape.childFrameShapes) {
    frameShape.childFrameShapes.map(childFrameShape => {
      pointsToFrameShape({
        frameShape: childFrameShape,
        points,
        pointsMap
      })
    })
  }

  return frameShape
}

/**
 * Applies an array of transforms to a FrameShape.
 *
 * @param {FrameShape} frameShape
 * @param {(string|number)[][]} transforms
 *
 * @return {FrameShape}
 *
 * @example
 * transform(frameShape, [[ 'rotate', 45 ]])
 */
const transform = (frameShape, transforms) => transforms.reduce(apply, frameShape)

/**
 * Applies an array of transforms to Points.
 *
 * @param {Points} points
 * @param {(string|number)[][]} transforms
 *
 * @return {Points}
 *
 * @example
 * transform(points, [[ 'rotate', 45 ]])
 */
const transformPoints = (points, transforms) => (
  transforms.reduce((nextPoints, [ name, ...args ]) => (
    transformFunctions[ name ](nextPoints, ...args)
  ), points)
)

export { flattenPoints, pointsToFrameShape, transformPoints }
export default transform

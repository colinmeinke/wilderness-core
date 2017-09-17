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
  const childFrameShapes = frameShape.childFrameShapes

  if (childFrameShapes) {
    for (let i = 0, l = childFrameShapes.length; i < l; i++) {
      flattenPoints(childFrameShapes[ i ], points, pointsMap)
    }
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
  const childFrameShapes = frameShape.childFrameShapes

  if (frameShape.points) {
    frameShape.points = points[ pointsMap.get(frameShape) ]
  }

  if (childFrameShapes) {
    for (let i = 0, l = childFrameShapes.length; i < l; i++) {
      pointsToFrameShape({
        frameShape: childFrameShapes[ i ],
        points,
        pointsMap
      })
    }
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
const transform = (frameShape, transforms) => {
  for (let i = 0, l = transforms.length; i < l; i++) {
    frameShape = apply(frameShape, transforms[ i ])
  }

  return frameShape
}

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
const transformPoints = (points, transforms) => {
  for (let i = 0, l = transforms.length; i < l; i++) {
    const [ name, ...args ] = transforms[ i ]
    points = transformFunctions[ name ](points, ...args)
  }

  return points
}

export { flattenPoints, pointsToFrameShape, transformPoints }
export default transform

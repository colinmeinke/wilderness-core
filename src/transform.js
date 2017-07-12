import * as transformFunctions from 'points'

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
  if (frameShape.points) {
    frameShape.points = transformFunctions[ name ](frameShape.points, ...args)
  }

  if (frameShape.childFrameShapes) {
    frameShape.childFrameShapes = frameShape.childFrameShapes.map(childFrameShape => (
      apply(childFrameShape, [ name, ...args ])
    ))
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

export default transform

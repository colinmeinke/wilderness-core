import transformFunctions from 'points'

/**
 * Applies Transforms to FrameShape Points
 *
 * @param {FrameShape} frameShape
 * @param {[][]} transforms
 *
 * @return {FrameShape}
 *
 * @example
 * transform(frameShape, [[ 'rotate', 45 ]])
 */
const transform = (frameShape, transforms) => transforms.reduce((f, t) => {
  return f
}, frameShape)

export default transform

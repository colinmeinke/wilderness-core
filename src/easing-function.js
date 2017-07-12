/* globals __DEV__ */

import tweenFunctions from 'tween-functions'

/**
 * An easing function.
 *
 * @param {(function|string)} easing - An easing function or the name of an easing function from https://github.com/chenglou/tween-functions.
 *
 * @returns {function}
 *
 * @example
 * easingFunc('easeInOutQuad')
 */
const easingFunction = easing => {
  switch (typeof easing) {
    case 'string':
      if (tweenFunctions[ easing ]) {
        return tweenFunctions[ easing ]
      }

      if (__DEV__) {
        throw new TypeError(
          `Easing must match one of the options defined by https://github.com/chenglou/tween-functions`
        )
      }

      break

    case 'function':
      return easing

    default:
      if (__DEV__) {
        throw new TypeError(`Easing must be of type function or string`)
      }

      break
  }
}

export default easingFunction

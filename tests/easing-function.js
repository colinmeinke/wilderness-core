/* globals describe it expect */

import easingFunction from '../src/easing-function'

describe('easing-function', () => {
  it('should throw if easing string is not found', () => {
    expect(() => easingFunction('potato')).toThrow(
      `Easing must match one of the options defined by https://github.com/chenglou/tween-functions`
    )
  })

  it('should throw if easingFunction not passed a string or function', () => {
    expect(() => easingFunction([])).toThrow(`Easing must be of type function or string`)
  })

  it('should return a function when passed a string', () => {
    expect(typeof easingFunction('easeInOutBack')).toBe('function')
  })

  it('should return the same function when passed a function', () => {
    const easing = () => console.log('hello world')
    expect(easingFunction(easing)).toBe(easing)
  })
})

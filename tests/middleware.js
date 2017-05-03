/* globals describe it expect */

import colorMiddleware from '../src/color-middleware'
import { input, output } from '../src/middleware'

const pointlessMiddleware = {
  name: 'pointless',
  input: value => {
    if (typeof value === 'object' && value.middleware === colorMiddleware.name) {
      return {
        ...value,
        g: { middleware: 'pointless' }
      }
    }

    return value
  },
  output: value => {
    if (typeof value === 'object' && value.middleware === 'pointless') {
      return 255
    }

    return value
  }
}

describe('input', () => {
  it('should return the same value if no middleware applies', () => {
    const middleware = [ colorMiddleware ]
    const value = { foo: 1 }

    expect(input(value, middleware)).toEqual(value)
  })

  it('should apply middleware to object values', () => {
    const middleware = [ colorMiddleware ]
    const value = { foo: 1, bar: '#FFF' }

    const expectedResult = {
      foo: 1,
      bar: {
        middleware: colorMiddleware.name,
        r: 255,
        g: 255,
        b: 255,
        a: 1
      }
    }

    expect(input(value, middleware)).toEqual(expectedResult)
  })

  it('should apply middleware to array items', () => {
    const middleware = [ colorMiddleware ]
    const value = [ 'rgb(255, 255, 255)' ]

    const expectedResult = [
      {
        middleware: colorMiddleware.name,
        r: 255,
        g: 255,
        b: 255,
        a: 1
      }
    ]

    expect(input(value, middleware)).toEqual(expectedResult)
  })

  it('should apply middleware to strings', () => {
    const middleware = [ colorMiddleware ]
    const value = 'rgba(255,255,255,1)'

    const expectedResult = {
      middleware: colorMiddleware.name,
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }

    expect(input(value, middleware)).toEqual(expectedResult)
  })

  it('should compound if multiple middleware apply', () => {
    const middleware = [ colorMiddleware, pointlessMiddleware ]
    const value = 'rgba(255,255,255,1)'

    const expectedResult = {
      middleware: colorMiddleware.name,
      r: 255,
      g: { middleware: 'pointless' },
      b: 255,
      a: 1
    }

    expect(input(value, middleware)).toEqual(expectedResult)
  })

  describe('output', () => {
    it('should return the same value if no middleware applies', () => {
      const middleware = [ colorMiddleware ]
      const value = { foo: 1 }

      expect(output(value, middleware)).toEqual(value)
    })

    it('should apply middleware to object values', () => {
      const middleware = [ colorMiddleware ]
      const value = {
        foo: 1,
        bar: {
          middleware: colorMiddleware.name,
          r: 255,
          g: 255,
          b: 255,
          a: 1
        }
      }

      const expectedResult = { foo: 1, bar: 'rgba(255,255,255,1)' }

      expect(output(value, middleware)).toEqual(expectedResult)
    })

    it('should apply middleware to array items', () => {
      const middleware = [ colorMiddleware ]
      const value = [
        {
          middleware: colorMiddleware.name,
          r: 255,
          g: 255,
          b: 255,
          a: 1
        }
      ]

      const expectedResult = [ 'rgba(255,255,255,1)' ]

      expect(output(value, middleware)).toEqual(expectedResult)
    })

    it('should apply middleware to strings', () => {
      const middleware = [ colorMiddleware ]
      const value = {
        middleware: colorMiddleware.name,
        r: 255,
        g: 255,
        b: 255,
        a: 1
      }

      const expectedResult = 'rgba(255,255,255,1)'

      expect(output(value, middleware)).toEqual(expectedResult)
    })

    it('should compound if multiple middleware apply', () => {
      const middleware = [ colorMiddleware, pointlessMiddleware ]
      const value = {
        middleware: colorMiddleware.name,
        r: 255,
        g: { middleware: 'pointless' },
        b: 255,
        a: 1
      }

      const expectedResult = 'rgba(255,255,255,1)'

      expect(output(value, middleware)).toEqual(expectedResult)
    })
  })
})

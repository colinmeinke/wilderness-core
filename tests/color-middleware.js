/* globals describe it expect */

import colorMiddleware from '../src/color-middleware'

describe('input', () => {
  it('converts hex string to color', () => {
    const expectedResult = {
      middleware: 'color',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }

    expect(colorMiddleware.input('#ffffff')).toEqual(expectedResult)
  })

  it('converts rgb string to color', () => {
    const expectedResult = {
      middleware: 'color',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }

    expect(colorMiddleware.input('rgb(255,255,255)')).toEqual(expectedResult)
  })

  it('converts rgba string to color', () => {
    const expectedResult = {
      middleware: 'color',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }

    expect(colorMiddleware.input('rgba(255,255,255,1)')).toEqual(expectedResult)
  })

  it('converts html color string to color', () => {
    const expectedResult = {
      middleware: 'color',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }

    expect(colorMiddleware.input('white')).toEqual(expectedResult)
  })

  it('does not convert unknown string', () => {
    const input = 'unknown'
    expect(colorMiddleware.input(input)).toEqual(input)
  })

  it('accepts shorthand hex string', () => {
    const expectedResult = {
      middleware: 'color',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }

    expect(colorMiddleware.input('#fff')).toEqual(expectedResult)
  })
})

describe('output', () => {
  it('converts color to rgba string', () => {
    expect(colorMiddleware.output({
      middleware: 'color',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    })).toBe('rgba(255,255,255,1)')
  })

  it('does not convert other middleware', () => {
    const input = {
      middleware: 'other',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }

    expect(colorMiddleware.output(input)).toBe(input)
  })
})

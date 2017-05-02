/* globals describe it expect */

import colorMiddleware from '../src/color-middleware'

describe('input', () => {
  it('converts hex string to hex color', () => {
    const { type } = colorMiddleware.input('#ffffff')
    expect(type).toBe('hex')
  })

  it('converts rgb string to rgb color', () => {
    const { type } = colorMiddleware.input('rgb(255,255,255)')
    expect(type).toBe('rgb')
  })

  it('converts rgba string to rgba color', () => {
    const { type } = colorMiddleware.input('rgba(255,255,255,1)')
    expect(type).toBe('rgba')
  })

  it('does not convert unknown string', () => {
    const input = 'white'
    expect(colorMiddleware.input(input)).toBe(input)
  })

  it('accepts shorthand hex string', () => {
    const { type } = colorMiddleware.input('#fff')
    expect(type).toBe('hex')
  })
})

describe('output', () => {
  it('converts hex color to hex string', () => {
    expect(colorMiddleware.output({
      middleware: 'color',
      type: 'hex',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    })).toBe('#ffffff')
  })

  it('converts rgb color to rgb string', () => {
    expect(colorMiddleware.output({
      middleware: 'color',
      type: 'rgb',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    })).toBe('rgb(255,255,255)')
  })

  it('converts rgba color to rgba string', () => {
    expect(colorMiddleware.output({
      middleware: 'color',
      type: 'rgba',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    })).toBe('rgba(255,255,255,1)')
  })

  it('does not convert other middleware', () => {
    const input = {
      middleware: 'other',
      type: 'rgba',
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }

    expect(colorMiddleware.output(input)).toBe(input)
  })
})

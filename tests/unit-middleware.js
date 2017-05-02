/* globals describe it expect */

import unitMiddleware from '../src/unit-middleware'

describe('input', () => {
  it('converts single unit string to unit object with one value', () => {
    const { values } = unitMiddleware.input('20px')
    expect(values).toEqual([[ 20, 'px' ]])
  })

  it('converts multi unit string to unit object with mutliple values', () => {
    const { values } = unitMiddleware.input('20px 100vw 50% 2.5rem')
    expect(values).toEqual([[ 20, 'px' ], [ 100, 'vw' ], [ 50, '%' ], [ 2.5, 'rem' ]])
  })

  it('does not convert unknown string', () => {
    expect(unitMiddleware.input('15feet')).toBe('15feet')
  })
})

describe('output', () => {
  it('converts unit object to unit string', () => {
    expect(unitMiddleware.output({
      middleware: 'unit',
      values: [[ 20, 'px' ]]
    })).toBe('20px')
  })

  it('converts multi unit object to unit string', () => {
    expect(unitMiddleware.output({
      middleware: 'unit',
      values: [
        [ 20, 'px' ],
        [ 100, 'vw' ],
        [ 50, '%' ],
        [ 2.5, 'rem' ]
      ]
    })).toBe('20px 100vw 50% 2.5rem')
  })

  it('does not convert other middleware', () => {
    const value = {
      middleware: 'other',
      values: [[ 20, 'px' ]]
    }

    expect(unitMiddleware.output(value)).toBe(value)
  })
})

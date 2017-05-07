/* globals describe it expect */

import clone from '../src/clone'

describe('clone', () => {
  it('should clone a string', () => {
    let a = 'foo'
    let b = clone(a)

    a = 'bar'

    expect(a).toBe('bar')
    expect(b).toBe('foo')
  })

  it('should clone a number', () => {
    let a = 10
    let b = clone(a)

    a = 3

    expect(a).toBe(3)
    expect(b).toBe(10)
  })

  it('should clone an array', () => {
    let a = [ 'foo', 'bar' ]
    let b = clone(a)

    a.push('baz')

    expect(a).toEqual([ 'foo', 'bar', 'baz' ])
    expect(b).toEqual([ 'foo', 'bar' ])
  })

  it('should clone an object', () => {
    let a = { foo: 1, bar: 2 }
    let b = clone(a)

    a.baz = 3

    expect(a).toEqual({ foo: 1, bar: 2, baz: 3 })
    expect(b).toEqual({ foo: 1, bar: 2 })
  })

  it('should deep clone', () => {
    let a = { foo: [ 1, 2, { bar: 3 } ] }
    let b = clone(a)

    a.foo[ 2 ].bar = 4

    expect(a).toEqual({ foo: [ 1, 2, { bar: 4 } ] })
    expect(b).toEqual({ foo: [ 1, 2, { bar: 3 } ] })
  })
})

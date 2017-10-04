/* globals describe it expect */

import {
  colorMiddleware,
  flushEvents,
  frame,
  motionPath,
  pause,
  plainShapeObject,
  play,
  shape,
  timeline,
  unitMiddleware
} from '../src'

describe('colorMiddleware', () => {
  it('should be exported', () => {
    expect(typeof colorMiddleware).toBe('object')
    expect(colorMiddleware).toHaveProperty('name')
    expect(colorMiddleware).toHaveProperty('input')
    expect(colorMiddleware).toHaveProperty('output')
  })
})

describe('flushEvents', () => {
  it('should be exported', () => {
    expect(typeof flushEvents).toBe('function')
  })
})

describe('frame', () => {
  it('should be exported', () => {
    expect(typeof frame).toBe('function')
  })
})

describe('motionPath', () => {
  it('should be exported', () => {
    expect(typeof motionPath).toBe('function')
  })
})

describe('pause', () => {
  it('should be exported', () => {
    expect(typeof pause).toBe('function')
  })
})

describe('plainShapeObject', () => {
  it('should be exported', () => {
    expect(typeof plainShapeObject).toBe('function')
  })
})

describe('play', () => {
  it('should be exported', () => {
    expect(typeof play).toBe('function')
  })
})

describe('shape', () => {
  it('should be exported', () => {
    expect(typeof shape).toBe('function')
  })
})

describe('timeline', () => {
  it('should be exported', () => {
    expect(typeof timeline).toBe('function')
  })
})

describe('unitMiddleware', () => {
  it('should be exported', () => {
    expect(typeof unitMiddleware).toBe('object')
    expect(unitMiddleware).toHaveProperty('name')
    expect(unitMiddleware).toHaveProperty('input')
    expect(unitMiddleware).toHaveProperty('output')
  })
})

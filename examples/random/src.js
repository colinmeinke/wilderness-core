import { play, render } from '../crude-wilderness-dom'
import { shape, timeline, plainShapeObject } from '../../src'

let currentCircles = 1
let allowedCircles = 50

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

const randomColor = () => `#${Math.random().toString(16).slice(2, 8)}`

const bounds = r => ({
  min: { x: r, y: r },
  max: { x: 100 - r, y: 100 - r }
})

const randomCircle = from => {
  const r = randomNumber(1, 3.5)

  const to = {
    type: 'circle',
    cx: randomNumber(bounds(r).min.x, bounds(r).max.x),
    cy: randomNumber(bounds(r).min.y, bounds(r).max.y),
    r,
    fill: randomColor()
  }

  return shape(from, to)
}

const initialR = randomNumber(1, 3.5)

let initialCircle = randomCircle({
  type: 'circle',
  cx: randomNumber(bounds(initialR).min.x, bounds(initialR).max.x),
  cy: randomNumber(bounds(initialR).min.y, bounds(initialR).max.y),
  r: initialR,
  fill: randomColor()
})

const renderCircle = circle => {
  const animation = timeline(circle, {
    alternate: true,
    duration: randomNumber(1000, 3000),
    iterations: Infinity
  })

  render(document.querySelector('svg'), animation)

  play(animation)
}

const generateNewCircle = circle => {
  const int = setInterval(() => {
    currentCircles++

    if (currentCircles <= allowedCircles) {
      const nextCircle = randomCircle(plainShapeObject(circle))
      renderCircle(nextCircle)
      generateNewCircle(nextCircle)
    } else {
      clearInterval(int)
    }
  }, randomNumber(3000, 10000))
}

renderCircle(initialCircle)
generateNewCircle(initialCircle)

import { play, render } from '../crude-wilderness-dom'
import { shape, timeline } from '../../src'

const from = {
  type: 'g',
  shapes: [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      fill: 'yellow'
    },
    {
      type: 'rect',
      x: 90,
      y: 0,
      width: 10,
      height: 10,
      fill: 'red'
    },
    {
      type: 'rect',
      x: 0,
      y: 90,
      width: 10,
      height: 10,
      fill: 'blue'
    },
    {
      type: 'rect',
      x: 90,
      y: 90,
      width: 10,
      height: 10,
      fill: 'green'
    }
  ]
}

const to = {
  type: 'rect',
  x: 40,
  y: 40,
  width: 20,
  height: 20,
  fill: '#3C9632'
}

const morph = shape(from, to)

const animation = timeline(morph, {
  alternate: true,
  duration: 3000,
  iterations: Infinity
})

render(document.querySelector('svg'), animation)

play(animation)

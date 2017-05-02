import { play, render } from '../crude-wilderness-dom'
import { shape, timeline } from '../../src'

const shapeAKeyframe1 = { type: 'rect', width: 10, height: 10, x: 0, y: 0, fill: '#E54' }
const shapeAKeyframe2 = { type: 'rect', width: 10, height: 10, x: 90, y: 90, duration: 1000, fill: 'rgb(255,255,80)' }

const shapeA = shape(shapeAKeyframe1, shapeAKeyframe2)

const shapeBKeyframe1 = { type: 'rect', width: 10, height: 10, x: 90, y: 0, fill: '#000' }
const shapeBKeyframe2 = { type: 'rect', width: 10, height: 10, x: 0, y: 90, duration: 2000, easing: 'easeInOutElastic', fill: 'rgb(240,240,240)' }

const shapeB = shape(shapeBKeyframe1, shapeBKeyframe2)

const animation = timeline(shapeA, [ shapeB, { queue: -500 } ], {
  alternate: true,
  iterations: 10
})

render(document.querySelector('svg'), animation)

play(animation)

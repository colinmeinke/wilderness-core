import { play, render } from '../crude-wilderness-dom'
import { shape, timeline } from '../../src'

const shapeAKeyframe1 = { type: 'rect', width: 10, height: 10, x: 0, y: 0 }
const shapeAKeyframe2 = { type: 'rect', width: 10, height: 10, x: 90, y: 90, duration: 1000 }

const shapeA = shape(shapeAKeyframe1, shapeAKeyframe2)

const shapeBKeyframe1 = { type: 'rect', width: 10, height: 10, x: 90, y: 0 }
const shapeBKeyframe2 = { type: 'rect', width: 10, height: 10, x: 0, y: 90, duration: 1000 }

const shapeB = shape(shapeBKeyframe1, shapeBKeyframe2)

const animation = timeline(shapeA, [ shapeB, { queue: -500 } ], {
  alternate: true,
  iterations: 10
})

render(document.querySelector('svg'), animation)

play(animation)

import { play, render } from '../crude-wilderness-dom'
import { shape, timeline } from '../../src'

const shapeAKeyframe1 = {
  type: 'rect',
  width: 10,
  height: 10,
  x: 0,
  y: 0,
  fill: '#E54'
}

const shapeAKeyframe2 = {
  type: 'rect',
  width: 10,
  height: 10,
  x: 90,
  y: 90,
  duration: 1000,
  fill: 'rgb(255,255,80)',
  transforms: [[ 'rotate', -45 ], [ 'offset', 0, -7 ], [ 'scale', 1.5 ]]
}

const shapeA = shape(shapeAKeyframe1, shapeAKeyframe2)

const shapeBKeyframe1 = {
  type: 'rect',
  width: 10,
  height: 10,
  x: 90,
  y: 0,
  fill: 'black'
}

const shapeBKeyframe2 = {
  type: 'path',
  d: 'M0,90h10v10h-10zM20,90h10v10h-10z',
  duration: 4000,
  easing: 'easeInOutElastic',
  fill: 'rgba(0,0,0,0.1)',
  transforms: [[ 'offset', 0, -15 ]]
}

const shapeB = shape(shapeBKeyframe1, shapeBKeyframe2)

const animation = timeline(shapeA, [ shapeB, { queue: -500 } ], {
  alternate: true,
  iterations: Infinity
})

render(document.querySelector('svg'), animation)

play(animation)

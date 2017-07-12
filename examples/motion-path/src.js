import { play, render } from '../crude-wilderness-dom'
import { shape, motionPath, timeline } from '../../src'

const circle = {
  type: 'circle',
  cx: 20,
  cy: 20,
  r: 20
}

const circleOnMotionPath = shape(circle, {
  ...circle,
  forces: [
    motionPath({
      type: 'rect',
      x: 0,
      y: 0,
      width: 60,
      height: 60
    })
  ]
})

const animation = timeline(circleOnMotionPath, {
  duration: 3000,
  iterations: Infinity
})

render(document.querySelector('svg'), animation)

play(animation)

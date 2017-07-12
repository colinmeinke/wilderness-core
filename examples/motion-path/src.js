import { play, render } from '../crude-wilderness-dom'
import { shape, motionPath, timeline } from '../../src'

const arrows = {
  type: 'g',
  shapes: [
    { type: 'path', d: 'M0,0L20,10L0,20Z' },
    { type: 'path', d: 'M20,10L40,20L20,30Z' },
    { type: 'path', d: 'M0,20L20,30L0,40Z' },
  ],
  transforms: [[ 'scale', 0.8 ]]
}

const motionPathCircle = {
  type: 'circle',
  cx: 30,
  cy: 30,
  r: 30,
}

const arrowsOnMotionPath = shape(arrows, {
  ...arrows,
  forces: [
    motionPath({
      ...motionPathCircle,
      rotate: -90,
      accuracy: 0.1
    })
  ]
})

const animation = timeline(arrowsOnMotionPath, {
  duration: 3000,
  iterations: Infinity
})

render(
  document.querySelector('svg'),
  animation,
  shape({
    ...motionPathCircle,
    fill: 'rgba(0,0,0,0.1)',
    transforms: [
      [ 'offset', 20, 20 ]
    ]
  })
)

play(animation)

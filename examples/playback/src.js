import { play, render } from '../crude-wilderness-dom'
import { pause, shape, timeline } from '../../src'

const playButton = document.querySelector('.play')
const pauseButton = document.querySelector('.pause')
const reverseButton = document.querySelector('.reverse')

const keyframe1 = { type: 'rect', width: 20, height: 20, x: 0, y: 40 }
const keyframe2 = { type: 'rect', width: 20, height: 20, x: 80, y: 40 }

const square = shape(keyframe1, keyframe2)

const animation = timeline(square, {
  alternate: true,
  duration: 3000,
  initialIteration: 0,
  iterations: Infinity,
  reverse: false
})

render(document.querySelector('svg'), animation)

play(animation)

playButton.addEventListener('click', () => play(animation))
pauseButton.addEventListener('click', () => pause(animation))
reverseButton.addEventListener('click', () => {
  console.log('reverse')
  play(animation, { reverse: true })
})

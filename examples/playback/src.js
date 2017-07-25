import { play, render } from '../crude-wilderness-dom'
import { pause, shape, timeline } from '../../src'

const playButton = document.querySelector('.play')
const pauseButton = document.querySelector('.pause')
const initialIterationsInput = document.querySelector('#initialIterations')
const iterationsInput = document.querySelector('#iterations')
const alternateInput = document.querySelector('#alternate')
const reverseInput = document.querySelector('#reverse')
const durationInput = document.querySelector('#duration')

const playbackOptions = () => {
  const opts = {}

  const initialIterations = initialIterationsInput.value.trim()
  const iterations = iterationsInput.value.trim()
  const alternate = alternateInput.value.trim()
  const reverse = reverseInput.value.trim()
  const duration = durationInput.value.trim()

  if (!isNaN(parseFloat(initialIterations))) {
    opts.initialIterations = parseFloat(initialIterations)
  }

  if (!isNaN(parseFloat(iterations))) {
    opts.iterations = parseFloat(iterations)
  } else if (iterations === 'Infinity') {
    opts.iterations = Infinity
  }

  if (alternate === 'true' || alternate === 'false') {
    opts.alternate = alternate === 'true'
  }

  if (reverse === 'true' || reverse === 'false') {
    opts.reverse = reverse === 'true'
  }

  if (!isNaN(parseFloat(duration))) {
    opts.duration = parseFloat(duration)
  } else if (duration === 'Infinity') {
    opts.duration = Infinity
  }

  return opts
}

const keyframe1 = { type: 'rect', width: 20, height: 20, x: 0, y: 40 }
const keyframe2 = { type: 'rect', width: 20, height: 20, x: 80, y: 40 }

const square = shape(keyframe1, keyframe2)

const animation = timeline(square)

render(document.querySelector('svg'), animation)

playButton.addEventListener('click', () => play(animation, playbackOptions()))

pauseButton.addEventListener('click', () => pause(animation, playbackOptions()))

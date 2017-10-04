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

const shape1Keyframe1 = { type: 'rect', width: 20, height: 20, x: 0, y: 40, name: 'KEYFRAME_1' }
const shape1Keyframe2 = { type: 'rect', width: 20, height: 20, x: 30, y: 40, name: 'KEYFRAME_2' }

const shape1 = shape(shape1Keyframe1, shape1Keyframe2)

const shape2Keyframe1 = { type: 'rect', width: 20, height: 20, x: 50, y: 40, name: 'KEYFRAME_1' }
const shape2Keyframe2 = { type: 'rect', width: 20, height: 20, x: 80, y: 40, name: 'KEYFRAME_2' }

const shape2 = shape(shape2Keyframe1, shape2Keyframe2)

const animation = timeline(
  [ shape1, { name: 'SHAPE_1' } ],
  [ shape2, { name: 'SHAPE_2' } ],
  {
    events: [
      [ 'timeline.start', () => console.log('timeline.start') ],
      [ 'timeline.finish', () => console.log('timeline.finish') ],
      [ 'shape.start', shapeName => console.log(`shape.start: ${shapeName}`) ],
      [ 'shape.finish', shapeName => console.log(`shape.finish: ${shapeName}`) ],
      [ 'keyframe', (keyframeName, shapeName) => console.log(`keyframe: ${shapeName} ${keyframeName}`) ],
      [ 'frame', () => console.log('frame') ]
    ]
  }
)

render(document.querySelector('svg'), animation)

playButton.addEventListener('click', () => play(animation, playbackOptions()))
pauseButton.addEventListener('click', () => pause(animation, playbackOptions()))

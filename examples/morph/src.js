import { play, render } from '../crude-wilderness-dom'
import { shape, timeline } from '../../src'

const from1 = {
  type: 'path',
  d: 'M20,20H80V80H20ZM30,30V70H70ZM40,40H60V60H40Z',
  'fill-rule': 'evenodd'
}

const from2 = {
  type: 'path',
  d: 'M20,120H80V180H20ZM30,130V170H70ZM40,140H60V160H40Z'
}

const from3 = {
  type: 'path',
  d: 'M20,220H80V280H20ZM30,230V270H70ZM40,240H60V260H40ZM35,250V265H50Z'
}

const to1 = {
  type: 'path',
  d: 'M290,40h20v20h-20z',
  'fill-rule': 'evenodd'
}

const to2 = {
  type: 'path',
  d: 'M290,140h20v20h-20z'
}

const to3 = {
  type: 'path',
  d: 'M290,240h20v20h-20z'
}

const shape1 = shape(from1, to1)
const shape2 = shape(from2, to2)
const shape3 = shape(from3, to3)

const animation = timeline(shape1, shape2, shape3, {
  alternate: true,
  duration: 3000,
  iterations: Infinity
})

render(document.querySelector('svg'), animation)

play(animation)

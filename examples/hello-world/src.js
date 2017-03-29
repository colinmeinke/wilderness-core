import { render } from '../crude-wilderness-dom'
import { shape } from '../../src/index.js'

render(
  document.querySelector('svg'),
  shape({ type: 'circle', cx: 50, cy: 50, r: 20 })
)

import { toPath } from 'svg-points'

const render = (svg, shape) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  el.setAttribute('d', toPath(shape.keyframes[ 0 ].frameShape.points))
  svg.appendChild(el)
}

export { render }

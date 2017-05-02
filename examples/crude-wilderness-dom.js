import { toPath } from 'svg-points'
import { frame } from '../src'

const play = timeline => {
  timeline.playbackOptions.started = Date.now()
  tick(timeline)
}

const tick = timeline => {
  window.requestAnimationFrame(() => {
    const frameShapes = frame(timeline)

    timeline.timelineShapes.map(({ shape }, i) => {
      update(shape.el, frameShapes[ i ])
    })

    tick(timeline)
  })
}

const addShape = (svg, shape) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  shape.el = el
  svg.appendChild(el)
}

const addTimeline = (svg, timeline) => {
  const frameShapes = frame(timeline)

  timeline.timelineShapes.map(({ shape }, i) => {
    addShape(svg, shape)
    update(shape.el, frameShapes[ i ])
  })
}

const render = (svg, ...shapesOrTimelines) => {
  shapesOrTimelines.map(x => {
    if (x.keyframes) {
      addShape(svg, x)
      update(x.el, x.keyframes[ 0 ].frameShape)
    } else {
      addTimeline(svg, x)
    }
  })
}

const update = (el, frameShape) => {
  el.setAttribute('d', toPath(frameShape.points))

  Object.keys(frameShape.attributes).map(k => {
    el.setAttribute(k, frameShape.attributes[ k ])
  })
}

export { play, render }

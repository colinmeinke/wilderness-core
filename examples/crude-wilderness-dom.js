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
      shape.el.setAttribute('d', toPath(frameShapes[ i ].points))
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
    shape.el.setAttribute('d', toPath(frameShapes[ i ].points))
  })
}

const render = (svg, ...shapesOrTimelines) => {
  shapesOrTimelines.map(x => {
    if (x.keyframes) {
      addShape(svg, x)
      x.el.setAttribute('d', toPath(x.keyframes[ 0 ].frameShape.points))
    } else {
      addTimeline(svg, x)
    }
  })
}

export { play, render }

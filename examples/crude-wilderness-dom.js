import { toPath } from 'svg-points'
import { frame, play as corePlay } from '../src'

const play = timeline => {
  corePlay(timeline)
  tick(timeline)
}

const tick = timeline => {
  window.requestAnimationFrame(() => {
    const frameShapes = frame(timeline)

    timeline.timelineShapes.map(({ shape }, i) => {
      updateEls(shape.els, frameShapes[ i ])
    })

    tick(timeline)
  })
}

const addTimeline = (svg, timeline) => {
  const frameShapes = frame(timeline)

  timeline.timelineShapes.map(({ shape }, i) => {
    shape.els = createEls(svg, frameShapes[ i ])
    updateEls(shape.els, frameShapes[ i ])
  })
}

const render = (svg, ...shapesOrTimelines) => {
  shapesOrTimelines.map((x, i) => {
    if (x.keyframes) {
      x.els = createEls(svg, x.keyframes[ 0 ].frameShape)
      updateEls(x.els, x.keyframes[ 0 ].frameShape)
    } else {
      addTimeline(svg, x)
    }
  })
}

const createEls = (svg, frameShape) => {
  if (frameShape.childFrameShapes) {
    return frameShape.childFrameShapes.map(childFrameShape => (
      createEls(svg, childFrameShape)
    ))
  }

  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  svg.appendChild(el)
  return el
}

const updateEls = (els, frameShape) => {
  if (frameShape.childFrameShapes) {
    frameShape.childFrameShapes.map((childFrameShape, i) => {
      updateEls(els[ i ], childFrameShape)
    })
  } else {
    els.setAttribute('d', toPath(frameShape.points))

    Object.keys(frameShape.attributes).map(k => {
      els.setAttribute(k, frameShape.attributes[ k ])
    })
  }
}

export { play, render }

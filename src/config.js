import colorMiddleware from './color-middleware'
import unitMiddleware from './unit-middleware'

const config = {
  defaults: {
    keyframe: {
      duration: 250,
      easing: 'easeInOutQuad'
    },
    motionPath: {
      easing: 'easeInOutQuad'
    },
    timeline: {
      alternate: false,
      initialIterations: 0,
      iterations: 1,
      middleware: [ colorMiddleware, unitMiddleware ],
      queue: 0,
      reverse: false
    }
  }
}

export default config

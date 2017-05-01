import colorMiddleware from './color-middleware'

const config = {
  defaults: {
    keyframe: {
      duration: 250,
      easing: 'easeInOutQuad'
    },
    timeline: {
      alternate: false,
      delay: 0,
      initialIterations: 0,
      iterations: 1,
      middleware: [ colorMiddleware ],
      queue: 0,
      reverse: false
    }
  }
}

export default config

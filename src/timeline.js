const sort = props => {
  return { shapes: props, options: {} }
}

const timeline = (...props) => {
  const {
    shapes,
    options: {
      alternate,
      delay,
      duration,
      initialIterations,
      iterations,
      reverse,
      started
    }
  } = sort(props)

  return {
    shapes: shapes.map(shape => ({
      shape,
      position: {
        start: 0,
        end: 1
      }
    })),
    playback: {
      alternate,
      delay,
      duration,
      initialIterations,
      iterations,
      reverse,
      started
    }
  }
}

export default timeline

const sort = props => {
  if (props.length === 0) {
    throw new TypeError(
      `The timeline function must be passed at least one Shape`
    )
  }

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

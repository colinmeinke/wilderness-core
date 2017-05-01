const apply = (value, func) => {
  if (Array.isArray(value)) {
    return value.map(v => apply(v, func))
  }

  if (value !== null && typeof value === 'object') {
    const obj = {}

    Object.keys(k => {
      obj[ k ] = apply(value[ k ], func)
    })

    return obj
  }

  return func(value)
}

const input = (value, middleware) => middleware.reduce((v, m) => (
  apply(v, m.input)
), value)

const output = (value, middleware) => [ ...middleware ].reverse().reduce((v, m) => (
  apply(v, m.output)
), value)

export { input, output }

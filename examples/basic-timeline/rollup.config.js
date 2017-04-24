import babel from 'rollup-plugin-babel'
import commonJs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'examples/basic-timeline/src.js',
  dest: 'examples/basic-timeline/dist.js',
  format: 'iife',
  plugins: [
    babel({ exclude: 'node_modules/**' }),
    commonJs(),
    nodeResolve()
  ]
}

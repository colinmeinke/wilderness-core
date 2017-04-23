import babel from 'rollup-plugin-babel'
import commonJs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'examples/basic-tween/src.js',
  dest: 'examples/basic-tween/dist.js',
  format: 'iife',
  plugins: [
    babel({ exclude: 'node_modules/**' }),
    commonJs(),
    nodeResolve()
  ]
}

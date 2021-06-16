export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'TsSyncDecorator',
    globals: {},
    exports: 'named',
  },
  external: [],
}
# yolk-simple-modal

[Yolk](https://github.com/garbles/yolk) wrapper for [wunderlink/simple-modal](https://github.com/wunderlink/simple-modal). Makes `simple-modal` available as a Yolk `CustomComponent`.

## Installation
`npm install yolk-simple-modal --save`

Upon installation, the JS file you will want to use will be available at `./node_modules/yolk-simple-modal/dist/bundle.es5.js`. This file is an ES5 UMD bundle, meaning it works with CommonJS, RequireJS and `<script>` tags. The `dist` directory is not included in the git repo, but it is automatically compiled and published in the npm package via the `prepublish` script, which compiles the coffeescript, Jade and CSS from `simple-modal` and the TypeScript from this wrapper.

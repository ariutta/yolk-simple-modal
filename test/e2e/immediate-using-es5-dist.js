var Rx = global.Rx = yolk.Rx;
var yolk = require('yolk');
var h = yolk.h;

var render = yolk.render;

var YolkSimpleModal = require('../../dist/bundle.es5.js').default;

var vnode = h(YolkSimpleModal, {
  //className: 'placeholder-class-name',
  content: '<p>' +
    [
      'content: immediate',
      'source: ES5 bundle',
    ].join(',\ \n') +
  '</p>',
  title: 'Title: immediate, bundle',
});

var node = document.createElement('div');
document.body.appendChild(node);

render(vnode, node);

var Rx = global.Rx = require('rx');
var yolk = require('yolk');
var h = yolk.h;

var render = yolk.render;

var YolkSimpleModal = require('../../dist/bundle.es5.js').default;

var vnode = h(YolkSimpleModal, {
  //className: 'placeholder-class-name',
  content: Rx.Observable.return([
            'content: async',
            'source: ES5 bundle'
          ].join(',\ \n'))
          .delay(2 * 1000)
          .map(function(data) {
            //return h('p', {}, data);
            return '<p>' + data + '</p>';
          }),
  title: 'Title: async, bundle',
});

var node = document.createElement('div');
document.body.appendChild(node);

render(vnode, node);

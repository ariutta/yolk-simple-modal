var Rx = require('rx');
var yolk = require('yolk');
var h = yolk.h;
var noop = function() {};
var render = yolk.render;
var renderInDocument = require('../render-in-document');

var YolkSimpleModal = require('../../index.ts').default;

var vnode = h(YolkSimpleModal, {
  className: 'placeholder-class-name',
  content: Rx.Observable.return('hello asynchronous world')
          .delay(2 * 1000)
          .map(function(data) {
            //return h('p', {}, data);
            return '<p>' + data + '</p>';
          }),
  title: 'Sample Title',
});
var result = renderInDocument(vnode);
var node = result.node;
var cleanup = result.cleanup;

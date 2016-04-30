var yolk = require('yolk');
var h = yolk.h;
var noop = function() {};
var render = yolk.render;
var renderInDocument = require('../render-in-document');

var YolkSimpleModal = require('../../index.ts').SimpleModalWrapper;

var vnode = h(YolkSimpleModal, {
  className: 'placeholder-class-name',
  content: '<p>hello immediate world</p>',
  title: 'Sample Title',
});
var result = renderInDocument(vnode);
var node = result.node;
var cleanup = result.cleanup;

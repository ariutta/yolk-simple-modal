var Rx = global.Rx = require('Rx');
var yolk = require('yolk');
var h = yolk.h;
var noop = function() {};
var render = yolk.render;
var renderInDocument = require('../render-in-document');

var YolkSimpleModal = require('../../index.ts').default;

var vnode = h(YolkSimpleModal, {
  //className: 'placeholder-class-name',
  content: '<p>' +
    [
      'content: immediate',
      'source: budo output',
    ].join(',\ \n') +
  '</p>',
  title: 'Title: immediate, budo',
});
var result = renderInDocument(vnode);
var node = result.node;
var cleanup = result.cleanup;

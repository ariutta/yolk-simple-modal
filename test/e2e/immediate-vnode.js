var Rx = global.Rx = require('Rx');
var yolk = require('yolk');
var h = yolk.h;
var noop = function() {};
var render = yolk.render;

var YolkSimpleModal = require('../../index.ts').default;

//var vnode = h('p', null,
//    [
//      'async: no',
//      'content type: vnode',
//      'source: budo output',
//    ].join(',\ \n')
//);

//var vnode = h(YolkSimpleModal, {
//  //className: 'placeholder-class-name',
//  //content: content,
//  title: 'Title: immediate, budo, vnode',
//}, [
//  h('p', {},
//    [
//      'async: no',
//      'content type: vnode',
//      'source: budo output',
//    ].join(',\ \n')
//  )]
//);

var vnode = h(YolkSimpleModal, {
  //className: 'placeholder-class-name',
  content: h('p', {},
    [
      'async: no',
      'content type: vnode',
      'source: budo output',
    ].join(',\ \n')
  ),
  title: 'Title: immediate, budo, vnode',
});

var node = document.createElement('div');
document.body.appendChild(node);

render(vnode, node);

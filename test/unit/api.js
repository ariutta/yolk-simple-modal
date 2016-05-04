var $ = require('jquery');

var Rx = global.Rx = require('rx');

var yolk = require('yolk');
var h = yolk.h;
var noop = function() {};
var render = yolk.render;
var renderInDocument = require('../render-in-document');

var YolkSimpleModalBudo = require('../../index.ts').default;
var YolkSimpleModalES5Bundle = require('../../dist/bundle.es5.js').default;

function fireEvent(node, eventName) {
  // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
  var doc;
  var event;
  if (node.ownerDocument) {
    doc = node.ownerDocument;
  } else if (node.nodeType == 9) {
    // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
    doc = node;
  } else {
    throw new Error('Invalid node passed to fireEvent: ' + node.id);
  }

  if (node.dispatchEvent) {
    // Gecko-style approach (now the standard) takes more work
    var eventClass = '';

    // Different events have different event classes.
    // If this switch statement can't map an eventName to an eventClass,
    // the event firing is going to fail.
    switch (eventName) {
      // Dispatching of 'click' appears to not work correctly in Safari.
      // Use 'mousedown' or 'mouseup' instead.
      case 'click':
      case 'mousedown':
      case 'mouseup':
        eventClass = 'MouseEvents';
        break;

      case 'focus':
      case 'change':
      case 'blur':
      case 'select':
        eventClass = 'HTMLEvents';
        break;

      default:
        throw 'fireEvent: Couldn\'t find an event class for event \'' + eventName + '\'.';
    }
    event = doc.createEvent(eventClass);

    var bubbles = eventName == 'change' ? false : true;
    event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

    event.synthetic = true; // allow detection of synthetic events
    // The second parameter says go ahead with the default action
    node.dispatchEvent(event, true);
  } else if (node.fireEvent) {
    // IE-old school style
    event = doc.createEventObject();
    event.synthetic = true; // allow detection of synthetic events
    node.fireEvent('on' + eventName, event);
  }
}

describe('create a simple modal', function() {

  function run(bundler, content) {
    var YolkSimpleModal = bundler.value;
    describe('bundler: ' + bundler.name, function() {
      describe('content type: ' + content.type, function() {
        it('when content is immediately available', function(done) {
          var vnode = h(YolkSimpleModal, {
            //className: 'placeholder-class-name',
            content: content.value,
            title: ['immediate', bundler.name, content.type].join(',\ '),
            //buttons: [{}],
          });
          var result = renderInDocument(vnode);
          var node = result.node;
          var cleanup = result.cleanup;

          var $node = $(node);

          setTimeout(function() {
            assert.equal(node.tagName, 'DIV');
            //assert.equal(node.getAttribute('class'), 'placeholder-class-name');
            var actualTextContent = node.querySelector('#myparagraph').textContent;
            assert.equal(actualTextContent, 'hello world! (' + content.type + ')');

            cleanup();
            done();
          }, 1);
        });

        it('when content is asynchronously available', function(done) {
          // Note: timeout must be greater than delay
          var delay = 200;
          var timeout = delay + 10;

          var vnode = h(YolkSimpleModal, {
            //className: 'placeholder-class-name',
            //      content: '<p>hello world</p>',
            content: Rx.Observable.return(content.value)
                    .delay(delay),
            title: ['async', bundler.name, content.type].join(',\ '),
            //buttons: [{}],
          });
          var result = renderInDocument(vnode);
          var node = result.node;
          var cleanup = result.cleanup;

          var $node = $(node);

          setTimeout(function() {
            assert.equal(node.tagName, 'DIV');
            //assert.equal(node.getAttribute('class'), 'placeholder-class-name');
            var actualTextContent = node.querySelector('#myparagraph').textContent;
            assert.equal(actualTextContent, 'hello world! (' + content.type + ')');

            cleanup();
            done();
          }, timeout);
        });
      });
    });
  }

  var bundlers = [{
    name: 'karma preprocessor',
    value: YolkSimpleModalBudo
  }, {
    name: 'pre-bundled (ES5)',
    value: YolkSimpleModalES5Bundle
  }];
  var testElement = window.document.createElement('p');
  testElement.setAttribute('id', 'myparagraph');
  testElement.textContent = 'hello world! (HTMLElement)';

  // acceptable content types:
  // 1. string
  // 2. HTMLElement
  // 3. YolkComponent
  // 4. Observable with any of the above
  var contents = [{
    type: 'string',
    value: '<p id="myparagraph">hello world! (string)</p>',
  }, {
    type: 'HTMLElement',
    value: testElement,
  }, {
    type: 'YolkComponent',
    value: h('p', {
      id: 'myparagraph',
    }, 'hello world! (YolkComponent)'),
  }];

  bundlers.forEach(function(bundler) {
    contents.forEach(function(content) {
      run(bundler, content);
    });
  });

});

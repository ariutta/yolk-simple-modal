// TODO do the different input types:
// 1. string
// 2. HTMLElement
// 3. Function returning 1 or 2
// 4. Observable returning 1 or 2
var $ = require('jquery');

var Rx = require('rx');

var yolk = require('yolk');
var h = yolk.h;
var noop = function() {};
var render = yolk.render;
var renderInDocument = require('../render-in-document');

var YolkSimpleModal = require('../../index.ts').default;

// Note: must be greater than the debounce period
var timeout = 500;

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
  it('when content is immediately available', function(done) {
    var vnode = h(YolkSimpleModal, {
      //className: 'placeholder-class-name',
      content: '<p>hello immediate world</p>',
      title: 'Sample Title',
      //buttons: [{}],
    });
    var result = renderInDocument(vnode);
    var node = result.node;
    var cleanup = result.cleanup;

    var $node = $(node);

    setTimeout(function() {
      assert.equal(node.tagName, 'DIV');
      //assert.equal(node.getAttribute('class'), 'placeholder-class-name');

//        assert.equal($node.val(), '');
//
//        $node.val('1234').change();
//        $node.val('1234').trigger('change');
//        assert.equal($node.val(), '1234');
//
//        fireEvent($node[0], 'change');
//        assert.equal($node.val(), '1234');

      cleanup();
      done();
    }, timeout);
  });

  it('when content is asynchronously available', function(done) {
    var vnode = h(YolkSimpleModal, {
      //className: 'placeholder-class-name',
//      content: '<p>hello world</p>',
      content: Rx.Observable.return('hello asynchronous world')
              .delay(2 * 1000)
              .map(function(data) {
                //return h('p', {}, data);
                return '<p>' + data + '</p>';
              }),
      title: 'Sample Title',
      //buttons: [{}],
    });
    var result = renderInDocument(vnode);
    var node = result.node;
    var cleanup = result.cleanup;

    var $node = $(node);

    setTimeout(function() {
      setTimeout(function() {
        assert.equal(node.tagName, 'DIV');
        //assert.equal(node.getAttribute('class'), 'placeholder-class-name');

  //        assert.equal($node.val(), '');
  //
  //        $node.val('1234').change();
  //        $node.val('1234').trigger('change');
  //        assert.equal($node.val(), '1234');
  //
  //        fireEvent($node[0], 'change');
  //        assert.equal($node.val(), '1234');

        cleanup();
        done();
      }, 3 * 1000);
    }, timeout);
  });

//    it('select when identifier is pre-selected', function(done) {
//      var identifier$ = new Rx.Subject();
//      var vnode = h(YolkSimpleModal, {
//        identifier: identifier$,
//      });
//      var result = renderInDocument(vnode);
//      var node = result.node;
//      var cleanup = result.cleanup;
//
//      var $node = $(node);
//
//      identifier$.onNext('ENSG00000012048');
//
//      setTimeout(function() {
//        assert.equal(node.tagName, 'INPUT');
//
//        assert.equal($node.val(), 'ENSG00000012048');
//
//        $node.val('672');
//        fireEvent($node[0], 'change');
//        assert.equal($node.val(), '672');
//
//        cleanup();
//        done();
//      }, timeout);
//    });
//
//    it('enable and then select', function(done) {
//      var disabled$ = new Rx.Subject();
//      var vnode = h(YolkSimpleModal, {
//        disabled: disabled$
//      });
//      var result = renderInDocument(vnode);
//      var node = result.node;
//      var cleanup = result.cleanup;
//
//      var $node = $(node);
//
//      disabled$.onNext(true);
//
//      setTimeout(function() {
//        assert.equal(node.tagName, 'INPUT');
//
//        assert.equal($node.prop('disabled'), true);
//
//        setTimeout(function() {
//          disabled$.onNext(false);
//
//          $node.val('672');
//          fireEvent($node[0], 'change');
//          assert.equal($node.val(), '672');
//
//          cleanup();
//          done();
//        }, timeout);
//      }, timeout);
//    });
//
//    it('programmatically set identifier', function(done) {
//      var identifier$ = new Rx.Subject();
//      var vnode = h(YolkSimpleModal.IdentifierControl, {
//        identifier: identifier$,
//      });
//      var result = renderInDocument(vnode);
//      var node = result.node;
//      var cleanup = result.cleanup;
//
//      var $node = $(node);
//
//      identifier$.onNext('ENSG00000012048');
//
//      setTimeout(function() {
//        assert.equal(node.tagName, 'INPUT');
//
//        assert.equal($node.val(), 'ENSG00000012048');
//
//        cleanup();
//        done();
//      }, timeout);
//    });
//
//    it('programmatically set identifier and then programmatically update', function(done) {
//      var identifier$ = new Rx.Subject();
//      var vnode = h(YolkSimpleModal.IdentifierControl, {
//        identifier: identifier$,
//      });
//      var result = renderInDocument(vnode);
//      var node = result.node;
//      var cleanup = result.cleanup;
//
//      identifier$.onNext('1234');
//
//      var $node = $(node);
//
//      assert.equal(node.tagName, 'INPUT');
//
//      setTimeout(function() {
//        assert.equal($node.val(), '1234');
//
//        identifier$.onNext('ENSG00000012048');
//
//        assert.equal($node.val(), 'ENSG00000012048');
//
//        cleanup();
//        done();
//      }, timeout);
//    });
//
//    it('programmatically set identifier and then select', function(done) {
//      var identifier$ = new Rx.Subject();
//      var vnode = h(YolkSimpleModal, {
//        identifier: identifier$,
//      });
//      var result = renderInDocument(vnode);
//      var node = result.node;
//      var cleanup = result.cleanup;
//
//      identifier$.onNext('ENSG00000012048');
//
//      var $node = $(node);
//
//      assert.equal(node.tagName, 'INPUT');
//
//      setTimeout(function() {
//        assert.equal($node.val(), 'ENSG00000012048');
//
//        $node.val('1234');
//        fireEvent($node[0], 'change');
//        assert.equal($node.val(), '1234');
//
//        cleanup();
//        done();
//      }, timeout);
//    });
});

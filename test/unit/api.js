/*jshint expr: true*/
// above allows ...should.be.true to pass

// TODO test using modal body from mithril template "m(...)"

var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

var Rx = require('rx');

function isShown(el) {
  var $el = $(el);
  // see https://github.com/tmpvar/jsdom/issues/1048
  return !!el && !$el.is(':hidden') && !$el.parents().is(':hidden');
}

describe('api tests', function() {

  jsdom();

  var m;
  var mSimpleModal;
  var demo;
  var modalContent;

  before(function() {
    // JS-DOM doesn't yet support insertAdjacentHTML
    // (see issue https://github.com/tmpvar/jsdom/issues/1219),
    // so we need to use this polyfill from
    // https://gist.github.com/eligrey/1276030
    /*
     * insertAdjacentHTML.js
     *   Cross-browser full HTMLElement.insertAdjacentHTML implementation.
     *
     * 2011-10-10
     *
     * By Eli Grey, http://eligrey.com
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     */
    window.HTMLElement.prototype.insertAdjacentHTML = function(position, html) {
      var ref = this;
      var container = ref.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', '_');
      var refParent = ref.parentNode;
      var node;
      var firstChild;
      var nextSibling;

      container.innerHTML = html;

      switch (position.toLowerCase()) {
        case 'beforebegin':
          while ((node = container.firstChild)) {
            refParent.insertBefore(node, ref);
          }
          break;
        case 'afterbegin':
          firstChild = ref.firstChild;
          while ((node = container.lastChild)) {
            firstChild = ref.insertBefore(node, firstChild);
          }
          break;
        case 'beforeend':
          while ((node = container.firstChild)) {
            ref.appendChild(node);
          }
          break;
        case 'afterend':
          nextSibling = ref.nextSibling;
          while ((node = container.lastChild)) {
            nextSibling = refParent.insertBefore(node, nextSibling);
          }
          break;
      }
    };

    document.body.innerHTML = '';
    $ = require('jquery');
    m = require('mithril');
    mSimpleModal = require('../../index.js');

    /**********************
     * Modal content (body)
     **********************/
    modalContent = {};

    modalContent.view = function() {
      return m('table.table.table-hover.table-bordered', [
        m('thead', [
          m('tr', {}, [
            m('th', {}, 'Name'),
            m('th', {}, 'Datasource'),
            m('th', {}, 'Identifier')
          ])
        ]),
        m('tbody', {}, [
          demo.vm.xrefs().map(function(xref, index) {
            return m('tr[style="cursor: pointer;"]', {
              onclick: m.withAttr('textContent', demo.vm.closeAndSave)
            }, [
              m('td', {}, xref.displayName),
              m('td', {}, xref.db),
              m('td', {}, xref.identifier),
            ]);
          })
        ])
      ]);
    };

    /********************
     * Main section
     *******************/
    demo = {};

    //for simplicity, we use this component to namespace the model classes

    demo.vm = (function(done) {
      var vm = {};

      vm.init = function() {
        vm.showXrefs = m.prop(false);
        vm.xrefs = m.prop([]);

        vm.selectionValue = m.prop('');

        vm.modalStatus = function() {
          if (vm.showXrefs()) {
            var xrefs = vm.xrefs();
            if (xrefs && xrefs.length > 0) {
              return 'open';
            } else {
              return 'loading';
            }
          } else {
            return 'closed';
          }
        };

        vm.closeAndSave = function(value) {
          vm.showXrefs(false);
          vm.xrefs([]);
          vm.selectionValue(value);
          m.redraw();
        };

      };

      return vm;
    }());

    demo.controller = function() {
      demo.vm.init();
    };

    demo.view = function(ctrl) {
      var vm = demo.vm;
      return m('div', {}, [
        m('div#selection-value', {}, 'Selection Value: ' + vm.selectionValue()),
        (function() {
          return m.component(mSimpleModal, {
            title: 'Click a row to select an xref',
            // NOTE we can pass in the content as any one of the following:
            // 1) an HTML string,
            // 2) a mithril component
            // 3) a template in the mithril m(...) syntax
            content: modalContent,
            buttons: [{
              text: 'Cancel',
              closeOnClick: true,
              callback: vm.cancel
            }],
            onchange: function(value) {
              console.log('value');
              console.log(value);
            },
            status: vm.modalStatus()
          });
        })()
      ]);
    };

    var container = document.createElement('div');
    container.setAttribute('id', 'demo');
    document.body.appendChild(container);

    //initialize the application
    m.mount(document.querySelector('#demo'), {controller: demo.controller, view: demo.view});
  });

  describe('modal body from mithril component', function() {
    it('loads modal sync', function() {
      demo.vm.showXrefs(true);
      demo.vm.xrefs([{
        displayName: 'displayName1',
        db: 'db1',
        identifier: 'identifier1',
      }, {
        displayName: 'displayName2',
        db: 'db2',
        identifier: 'identifier2',
      }]);

      var modalContainerEl = document.querySelector('.simple-modal-holder');
      expect(isShown(modalContainerEl)).to.be.false;

      m.redraw(true);

      expect(isShown(modalContainerEl)).to.be.true;
    });

    it('displays non-modal content in background', function() {
      var selectionValueEl = document.querySelector('#selection-value');
      expect(isShown(selectionValueEl)).to.be.true;

      var overlayEl = document.querySelector('.simple-modal-overlay');
      expect(isShown(overlayEl)).to.be.true;
    });

    it('displays modal container', function() {
      var modalContainerEl = document.querySelector('.simple-modal-holder');
      expect(isShown(modalContainerEl)).to.be.true;
    });

    it('displays modal body', function() {
      var modalBodyEl = document.querySelector('.simple-modal-holder > .simple-modal-body');
      expect(isShown(modalBodyEl)).to.be.true;
    });

    it('displays modal title as requested', function() {
      var modalTitleEl = document.querySelector('.simple-modal-title');
      expect(isShown(modalTitleEl)).to.be.true;
      expect(modalTitleEl.textContent).eql('Click a row to select an xref');
    });

    it('displays modal content as requested', function() {
      var modalContentEl = document.querySelector('.simple-modal-content');
      expect(isShown(modalContentEl)).to.be.true;

      var firstTableCell = modalContentEl.querySelector('td');
      expect(isShown(firstTableCell)).to.be.true;
      expect(firstTableCell.textContent).eql('displayName1');
    });

    it('displays modal controls as requested', function() {
      var modalControlsEl = document.querySelector('.simple-modal-controls');
      expect(isShown(modalControlsEl)).to.be.true;

      var cancelButton = modalControlsEl.querySelector('button');
      expect(isShown(cancelButton)).to.be.true;
      expect(cancelButton.textContent).eql('Cancel');
    });

    it('closes modal and hides modal container', function() {
      demo.vm.closeAndSave();
      var modalContainerEl = document.querySelector('.simple-modal-holder');
      modalContainerEl = document.querySelector('.simple-modal-holder');
      expect(isShown(modalContainerEl)).to.be.false;
    });

    it('re-displays modal body', function() {
      demo.vm.showXrefs(true);
      var xrefs = demo.vm.xrefs();
      demo.vm.xrefs([{
        displayName: 'displayName1',
        db: 'db1',
        identifier: 'identifier1',
      }, {
        displayName: 'displayName2',
        db: 'db2',
        identifier: 'identifier2',
      }]);
      m.redraw(true);
      var modalBodyEl = document.querySelector('.simple-modal-body');
      expect(isShown(modalBodyEl)).to.be.true;
    });

    it('re-closes modal and hides modal container', function() {
      demo.vm.closeAndSave();
      demo.vm.xrefs([]);
      m.redraw(true);
      var modalContainerEl = document.querySelector('.simple-modal-holder');
      expect(isShown(modalContainerEl)).to.be.false;
    });

    it('re-displays modal body async (loading)', function() {
      demo.vm.showXrefs(true);
      m.redraw(true);
      var spinnerEl = document.querySelector('.spinner');
      spinnerEl = document.querySelector('.spinner');
      expect(isShown(spinnerEl)).to.be.true;
    });

    it('re-displays modal body async (loaded)', function(done) {
      var modalBodyEl = document.querySelector('.simple-modal-body');
      var spinnerEl = document.querySelector('.spinner');

      setTimeout(function() {
        demo.vm.xrefs([{
          displayName: 'displayName1a',
          db: 'db1',
          identifier: 'identifier1',
        }, {
          displayName: 'displayName2',
          db: 'db2',
          identifier: 'identifier2',
        }]);

        m.redraw(true);

        spinnerEl = document.querySelector('.spinner');
        expect(isShown(spinnerEl)).to.be.false;
        expect(isShown(modalBodyEl)).to.be.true;
        done();
      }, 50);
    });

    it('displays modal content as requested', function() {
      var modalContentEl = document.querySelector('.simple-modal-content');
      expect(isShown(modalContentEl)).to.be.true;

      var firstTableCell = modalContentEl.querySelector('td');
      expect(isShown(firstTableCell)).to.be.true;
      expect(firstTableCell.textContent).eql('displayName1a');
    });

    it('re-closes modal and hides modal container', function() {
      demo.vm.closeAndSave();
      demo.vm.xrefs([]);
      m.redraw(true);
      var modalContainerEl = document.querySelector('.simple-modal-holder');
      expect(isShown(modalContainerEl)).to.be.false;
    });

  });

  describe('modal body from html string', function() {
    it('re-displays modal body sync', function() {
      demo.vm.showXrefs(true);
      demo.vm.xrefs(['one', 'two']);

      modalContent = '<p id="html-string-content">Hello World!</p>',

      m.redraw(true);

      var modalBodyEl = document.querySelector('.simple-modal-body');
      expect(isShown(modalBodyEl)).to.be.true;
    });

    it('displays modal content as requested', function() {
      var modalContentEl = document.querySelector('.simple-modal-content');
      expect(isShown(modalContentEl)).to.be.true;

      var contentTextEl = modalContentEl.querySelector('#html-string-content');
      expect(isShown(contentTextEl)).to.be.true;
      expect(contentTextEl.textContent).eql('Hello World!');
    });

    it('re-closes modal and hides modal container', function() {
      demo.vm.closeAndSave();
      demo.vm.xrefs([]);
      m.redraw(true);
      var modalContainerEl = document.querySelector('.simple-modal-holder');
      expect(isShown(modalContainerEl)).to.be.false;
    });

  });

});

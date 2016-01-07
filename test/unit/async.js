var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

function isShown(el) {
  var $el = $(el);
  // see https://github.com/tmpvar/jsdom/issues/1048
  return !$el.is(':hidden') && !$el.parents().is(':hidden');
}

describe('async tests', function() {

  jsdom();

  var m;
  var mSimpleModal;
  var demo;

  before(function() {
    document.body.innerHTML = '';
    $ = require('jquery');

    m = require('mithril');
    mSimpleModal = require('../../index.js');

    /**********************
     * Modal content (body)
     **********************/
    var modalContent = {};

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

        vm.showXrefs = m.prop(true);

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

        vm.closeAndSave = function() {
          vm.showXrefs(false);
          m.redraw();
          // do something
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

  it('displays non-modal content in background', function() {
    var selectionValueEl = document.querySelector('#selection-value');
    expect(isShown(selectionValueEl)).to.be.true;

    var overlayEl = document.querySelector('.simple-modal-overlay');
    expect(isShown(overlayEl)).to.be.true;
  });

  var modalContainerEl;
  it('displays modal container', function() {
    modalContainerEl = document.querySelector('.simple-modal-holder');
    expect(isShown(modalContainerEl)).to.be.true;
  });

  var modalBodyEl;
  it('displays modal body', function() {
    modalBodyEl = modalContainerEl.querySelector('.simple-modal-body');
    expect(isShown(modalBodyEl)).to.be.true;
  });

  it('displays modal title as requested', function() {
    var modalTitleEl = modalBodyEl.querySelector('.simple-modal-title');
    expect(isShown(modalTitleEl)).to.be.true;
    expect(modalTitleEl.textContent).eql('Click a row to select an xref');
  });

  it('displays content loading icon', function() {
    var spinnerEl = modalBodyEl.querySelector('.spinner');
    expect(isShown(spinnerEl)).to.be.true;
  });

  it('displays modal controls as requested', function() {
    var modalControlsEl = modalBodyEl.querySelector('.simple-modal-controls');
    expect(isShown(modalControlsEl)).to.be.true;

    var cancelButton = modalControlsEl.querySelector('button');
    expect(isShown(cancelButton)).to.be.true;
    expect(cancelButton.textContent).eql('Cancel');
  });

  it('displays modal content as requested once loaded', function(done) {
    var modalContentEl = modalBodyEl.querySelector('.simple-modal-content');
    expect(isShown(modalContentEl)).to.be.true;

    setTimeout(function() {
      demo.vm.xrefs([{
        displayName: 'displayName1a',
        db: 'db1a',
        identifier: 'identifier1a',
      }, {
        displayName: 'displayName2a',
        db: 'db2a',
        identifier: 'identifier2a',
      }]);

      m.redraw();
      var firstTableCell = modalBodyEl.querySelector('td');
      expect(isShown(firstTableCell)).to.be.true;
      expect(firstTableCell.textContent).eql('displayName1a');
      done();
    }, 15);
  });

  it('closes modal and hides modal container', function() {
    demo.vm.closeAndSave();
    modalContainerEl = document.querySelector('.simple-modal-holder');
    expect(isShown(modalContainerEl)).to.be.false;
  });

});

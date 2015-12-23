var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

function expectIsVisible(el) {
  expect(el.style.visibility).satisfy(function(value) {
    return value === '' || value === 'visible';
  });
  expect(el.hidden).satisfy(function(value) {
    return value === false || typeof value === 'undefined';
  });
}

describe('api tests', function() {

  var m;
  var mSimpleModal;

  jsdom();

  before(function() {

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
              onclick: m.withAttr('textContent', mSimpleModal.wrapClose(demo.vm.closeAndSave))
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
    var demo = {};

    //for simplicity, we use this component to namespace the model classes

    demo.vm = (function(done) {
      var vm = {};

      vm.init = function() {

        vm.showXrefs = true;
        vm.xrefs = m.prop([{
          displayName: 'displayName1',
          db: 'db1',
          identifier: 'identifier1',
        }, {
          displayName: 'displayName2',
          db: 'db2',
          identifier: 'identifier2',
        }]);

        vm.selectionValue = m.prop('');
        vm.buttonId = m.prop('');
      };

      return vm;
    }());

    demo.controller = function() {
      demo.vm.init();
    };

    demo.view = function(ctrl) {
      return m('div', {}, [
        m('div#selection-value', {}, 'Selection Value: ' + demo.vm.selectionValue()),
        (function() {

          if (!demo.vm.showXrefs) {
            return;
          }

          var content;
          var xrefs = demo.vm.xrefs();
          if (!!xrefs && xrefs.length > 0) {
            content = modalContent;
          }

          return m.component(mSimpleModal.component, {
            title: 'Click a row to select an xref',
            // NOTE we can pass in the content as any one of the following:
            // 1) an HTML string,
            // 2) a mithril component
            // 3) a template in the mithril m(...) syntax
            //
            // If using 2 or 3 and you add any events that should close the modal,
            // be sure to wrap each event handler with mSimpleModal.wrapClose(...)
            content: content,
            buttons: [{
              text: 'Cancel',
              closeOnClick: true,
              callback: demo.vm.cancel
            }],
            onchange: function(value) {
              console.log('value');
              console.log(value);
            }
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
    expectIsVisible(selectionValueEl);

    var overlayEl = document.querySelector('.simple-modal-overlay');
    expectIsVisible(overlayEl);
  });

  var modalContainerEl;
  it('displays modal container', function() {
    modalContainerEl = document.querySelector('.simple-modal-holder');
    expectIsVisible(modalContainerEl);
  });

  var modalBodyEl;
  it('displays modal body', function() {
    modalBodyEl = modalContainerEl.querySelector('.simple-modal-body');
    expectIsVisible(modalBodyEl);
  });

  it('displays modal title as requested', function() {
    var modalTitleEl = modalBodyEl.querySelector('.simple-modal-title');
    expectIsVisible(modalTitleEl);
    expect(modalTitleEl.textContent).eql('Click a row to select an xref');
  });

  it('displays modal content as requested', function() {
    var modalContentEl = modalBodyEl.querySelector('.simple-modal-content');
    expectIsVisible(modalContentEl);

    var firstTableCell = modalBodyEl.querySelector('td');
    expectIsVisible(firstTableCell);
    expect(firstTableCell.textContent).eql('displayName1');
  });

  it('displays modal controls as requested', function() {
    var modalControlsEl = modalBodyEl.querySelector('.simple-modal-controls');
    expectIsVisible(modalControlsEl);

    var cancelButton = modalControlsEl.querySelector('button');
    expectIsVisible(cancelButton);
    expect(cancelButton.textContent).eql('Cancel');
  });

});

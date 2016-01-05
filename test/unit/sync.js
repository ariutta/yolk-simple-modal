var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

function getShownStatus(el) {
  var hidden = el.hidden;

  var style = getComputedStyle(el);
  visibility = style.visibility;
  display = style.display;

  return (hidden !== 'true') &&
          (visibility === '' || visibility === 'visible') &&
          (display !== 'none');
}

describe('sync tests', function() {

  jsdom();

  var m;
  var mSimpleModal;

  before(function() {
    document.body.innerHTML = '';
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
    expect(getShownStatus(selectionValueEl)).to.be.true;

    var overlayEl = document.querySelector('.simple-modal-overlay');
    expect(getShownStatus(overlayEl)).to.be.true;
  });

  var modalContainerEl;
  it('displays modal container', function() {
    modalContainerEl = document.querySelector('.simple-modal-holder');
    expect(getShownStatus(modalContainerEl)).to.be.true;
  });

  var modalBodyEl;
  it('displays modal body', function() {
    modalBodyEl = modalContainerEl.querySelector('.simple-modal-body');
    expect(getShownStatus(modalBodyEl)).to.be.true;
  });

  it('displays modal title as requested', function() {
    var modalTitleEl = modalBodyEl.querySelector('.simple-modal-title');
    expect(getShownStatus(modalTitleEl)).to.be.true;
    expect(modalTitleEl.textContent).eql('Click a row to select an xref');
  });

  it('displays modal content as requested', function() {
    var modalContentEl = modalBodyEl.querySelector('.simple-modal-content');
    expect(getShownStatus(modalContentEl)).to.be.true;

    var firstTableCell = modalBodyEl.querySelector('td');
    expect(getShownStatus(firstTableCell)).to.be.true;
    expect(firstTableCell.textContent).eql('displayName1');
  });

  it('displays modal controls as requested', function() {
    var modalControlsEl = modalBodyEl.querySelector('.simple-modal-controls');
    expect(getShownStatus(modalControlsEl)).to.be.true;

    var cancelButton = modalControlsEl.querySelector('button');
    expect(getShownStatus(cancelButton)).to.be.true;
    expect(cancelButton.textContent).eql('Cancel');
  });

});

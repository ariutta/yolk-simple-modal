/*jshint expr: true*/
// above allows ...should.be.true to pass

var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

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

  /*
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

    m.redraw();

    expect(isShown(modalContainerEl)).to.be.true;
  });
  //*/

  //*
  it('loads modal sync with timeout', function(done) {
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

    m.redraw();

    if (!isShown(modalContainerEl)) {
      console.warn('Missed a frame: modal should be visible');
    }

    //expect(isShown(modalContainerEl)).to.be.true;

    setTimeout(function() {
      expect(isShown(modalContainerEl)).to.be.true;
      done();
    }, 20);
  });
  //*/

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

  /*
  it('re-displays modal body sync', function() {
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
    m.redraw();
    console.log('html1');
    console.log(document.body.innerHTML);
    var modalBodyEl = document.querySelector('.simple-modal-body');
    expect(isShown(modalBodyEl)).to.be.true;
  });
  //*/

  //*
  it('re-displays modal body sync with timeout', function(done) {
    demo.vm.showXrefs(true);
    var xrefs = demo.vm.xrefs();
    console.log('xrefs');
    console.log(xrefs);
    demo.vm.xrefs([{
      displayName: 'displayName1',
      db: 'db1',
      identifier: 'identifier1',
    }, {
      displayName: 'displayName2',
      db: 'db2',
      identifier: 'identifier2',
    }]);
    m.redraw();
    setTimeout(function() {
      m.redraw();
      console.log('html test');
      console.log(document.body.outerHTML);
      var modalBodyEl = document.querySelector('.simple-modal-body');
      expect(isShown(modalBodyEl)).to.be.true;
      done();
    }, 15);
  });
  //*/

  it('re-closes modal and hides modal container', function() {
    demo.vm.closeAndSave();
    demo.vm.xrefs([]);
    m.redraw();
    var modalContainerEl = document.querySelector('.simple-modal-holder');
    expect(isShown(modalContainerEl)).to.be.false;
  });

  //*
  it('re-displays modal body sync with timeout', function(done) {
    demo.vm.showXrefs(true);
    var xrefs = demo.vm.xrefs();
    console.log('xrefs');
    console.log(xrefs);
    demo.vm.xrefs([{
      displayName: 'displayName1',
      db: 'db1',
      identifier: 'identifier1',
    }, {
      displayName: 'displayName2',
      db: 'db2',
      identifier: 'identifier2',
    }]);
    m.redraw();
    setTimeout(function() {
      m.redraw();
      console.log('html test');
      console.log(document.body.outerHTML);
      var modalBodyEl = document.querySelector('.simple-modal-body');
      expect(isShown(modalBodyEl)).to.be.true;
      done();
    }, 15);
  });
  //*/

  /*
  it('re-displays modal body async', function(done) {
    console.log('html267');
    console.log(document.body.outerHTML);

    demo.vm.showXrefs(true);
    m.redraw();

    console.log('html273');
    console.log(document.body.outerHTML);

    var modalBodyEl = document.querySelector('.simple-modal-body');
    var spinnerEl = document.querySelector('.spinner');
    if (!isShown(spinnerEl)) {
      console.warn('Missed a frame: spinner should be started');
    }

    console.log('html276');
    console.log(document.body.outerHTML);

    setTimeout(function() {
      spinnerEl = document.querySelector('.spinner');
      console.log('html281');
      console.log(document.body.outerHTML);
      // TODO the spinner exists here, but the entire modal
      // seems to be hidden.
      expect(isShown(spinnerEl)).to.be.true;

      console.log('html287');
      console.log(document.body.outerHTML);

      demo.vm.xrefs([{
        displayName: 'displayName1a',
        db: 'db1',
        identifier: 'identifier1',
      }, {
        displayName: 'displayName2',
        db: 'db2',
        identifier: 'identifier2',
      }]);

      m.redraw();
      if (!!spinnerEl && isShown(spinnerEl)) {
        console.warn('Missed a frame: spinner should be stopped');
      }
    }, 80);

    setTimeout(function() {
      spinnerEl = document.querySelector('.spinner');
      // TODO not sure whether the spinner element is hidden or destroyed.
      //expect(spinnerEl).to.be.null;
      expect(isShown(spinnerEl)).to.be.false;
      expect(isShown(modalBodyEl)).to.be.true;
      done();
    }, 180);
  });
  //*/

});

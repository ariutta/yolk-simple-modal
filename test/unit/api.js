var jsdom = require('mocha-jsdom');
var expect = require('chai').expect;

describe('mocha tests', function() {

  jsdom();

  it('has document', function() {

    var mSimpleModal = require('../../index.js');

    console.log('mSimpleModal');
    console.log(mSimpleModal);

    var div = document.createElement('div');
    expect(div.nodeName).eql('DIV');
  });

  it('has document', function() {

    var m = require('mithril');
    var Rx = require('Rx');
    var mSimpleModal = require('../../index.js');
    console.log('mSimpleModal');
    console.log(mSimpleModal);

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

    demo.vm = (function() {
      var vm = {};

      vm.init = function() {
        vm.xrefs = m.prop([]);

        var syncButton = document.querySelector('#sync-button');
        var clickSource = Rx.Observable.fromEvent(syncButton, 'click');

        var asyncButton = document.querySelector('#async-button');
        var asyncClickSource = Rx.Observable.fromEvent(asyncButton, 'click');

        var noIdButton = document.querySelector('.no-id-button');
        var noIdClickSource = Rx.Observable.fromEvent(noIdButton, 'click');

        vm.selectionValue = m.prop('');

        // Button ID
        vm.buttonId = m.prop('');
        var buttonIdAndResetSource = Rx.Observable.merge(
            clickSource, asyncClickSource, noIdClickSource)
          .map(function(e) {
            var target = e.target;
            return target.id || target.getAttribute('id');
          })
          .partition(function(id) {
            console.log('  partition');
            return !!id;
          });

        var buttonIdSource = buttonIdAndResetSource[0];
        var resetSource = buttonIdAndResetSource[1];

        buttonIdSource.subscribe(function(buttonId) {
          vm.buttonId(buttonId);
          vm.showXrefs = true;
          m.redraw();
        }, function(err) {
          console.log('  buttonIdSource onError');
        }, function() {
          console.log('  buttonIdSource onComplete');
        });

        resetSource.subscribe(function(x, i, o) {
          vm.buttonId('');
          vm.selectionValue('');
          m.redraw();
        }, function(err) {
          console.log('  resetSource onError');
        }, function() {
          console.log('  resetSource onComplete');
        });

        buttonIdSource.flatMap(function(value) {
          if (value === 'sync-button') {
            return Rx.Observable.just(value);
          }

          return Rx.Observable.fromNodeCallback(function(cb) {
            window.setTimeout(function() {
              console.log('  timeout');
              return cb(null, value);
            }, 1500);
          })();
        })
        .subscribe(function(buttonId) {
          vm.xrefs([{
            displayName: 'displayName1',
            db: 'db1',
            identifier: 'identifier1' + new Date().toISOString(),
          }, {
            displayName: 'displayName2',
            db: 'db2',
            identifier: 'identifier2',
          }]);
          m.redraw();
        }, function(err) {
          console.log('  buttonIdSource2 onError');
        }, function() {
          console.log('  buttonIdSource2 onComplete');
        });

        vm.closeAndSave = function(value) {
          console.log('saving...');
          console.log('value');
          console.log(value);
          vm.showXrefs = false;
          vm.xrefs = m.prop([]);
          vm.selectionValue(value);
        };

        vm.cancel = function() {
          console.log('canceled.');
          vm.showXrefs = false;
          vm.xrefs = m.prop([]);
        };
      };

      return vm;
    }());

    demo.controller = function() {
      demo.vm.init();
    };

    demo.view = function(ctrl) {
      return m('div', {}, [
        m('div#button-id', {}, 'Button ID: ' + demo.vm.buttonId()),
        m('div', {}, 'Selection Value: ' + demo.vm.selectionValue()),
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

    var syncButton = document.createElement('button');
    syncButton.setAttribute('id', 'sync-button');
    syncButton.setAttribute('type', 'submit');
    syncButton.setAttribute('action', '#');
    syncButton.textContent = 'Open Modal (Sync Source)';
    document.body.appendChild(syncButton);

    var asyncButton = document.createElement('button');
    asyncButton.setAttribute('id', 'async-button');
    asyncButton.setAttribute('type', 'submit');
    asyncButton.setAttribute('action', '#');
    asyncButton.textContent = 'Open Modal (Async Source)';
    document.body.appendChild(asyncButton);

    var noIdButton = document.createElement('button');
    noIdButton.setAttribute('class', 'no-id-button');
    noIdButton.setAttribute('type', 'submit');
    noIdButton.setAttribute('action', '#');
    noIdButton.textContent = 'No ID (Will Reset)';
    document.body.appendChild(noIdButton);

    //initialize the application
    m.render(document.querySelector('#demo'), {controller: demo.controller, view: demo.view});

    expect(document.querySelector('#button-id').nodeName).eql('DIV');
  });

});

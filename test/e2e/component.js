var m = window.m;
var Rx = window.Rx;
var mSimpleModal = window.mSimpleModal;

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
var demo = {};

//for simplicity, we use this component to namespace the model classes

demo.vm = (function() {
  var vm = {};

  vm.init = function() {
    vm.xrefs = m.prop([]);
    vm.showXrefs = m.prop(false);

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
        console.log('id');
        console.log(id);
        return !!id;
      });

    var buttonIdSource = buttonIdAndResetSource[0];
    var resetSource = buttonIdAndResetSource[1];

    resetSource.subscribe(function(x, i, o) {
      vm.buttonId('');
      vm.selectionValue('');
      m.redraw();
    }, function(err) {
      console.log('  resetSource onError');
    }, function() {
      console.log('  resetSource onComplete');
      throw err;
    });

    buttonIdSource.flatMap(function(value) {
      vm.showXrefs(true);
      vm.buttonId(value);

      if (value === 'sync-button') {
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

        return Rx.Observable.just(value);
      }

      m.redraw();

      return Rx.Observable.fromNodeCallback(function(cb) {
        window.setTimeout(function() {
          console.log('  timeout');
          vm.xrefs([{
            displayName: 'displayName1',
            db: 'db1',
            identifier: 'identifier1' + new Date().toISOString(),
          }, {
            displayName: 'displayName2',
            db: 'db2',
            identifier: 'identifier2',
          }]);
          console.log('redrawing now...');
          m.redraw();
          return cb(null, value);
        }, 1500);
      })();
    })
    .subscribe(function(buttonId) {
      console.log('buttonId on subscribe');
      console.log(buttonId);
    }, function(err) {
      console.log('  buttonIdSource2 onError');
      throw err;
    }, function() {
      console.log('  buttonIdSource2 onComplete');
    });

    vm.closeAndSave = function(value) {
      console.log('saving...');
      console.log('value');
      console.log(value);
      vm.showXrefs(false);
      vm.xrefs([]);
      vm.selectionValue(value);
    };

    vm.cancel = function() {
      console.log('canceled.');
      vm.showXrefs(false);
      vm.xrefs([]);
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
    m('div', {}, 'Button ID: ' + vm.buttonId()),
    m('div', {}, 'Selection Value: ' + vm.selectionValue()),
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

//initialize the application
m.mount(document.querySelector('#demo'), {controller: demo.controller, view: demo.view});

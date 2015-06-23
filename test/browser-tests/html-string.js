var m = window.m;
var Rx = window.Rx;
var mSimpleModal = window.mSimpleModal;

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
        }, 3500);
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
    m('div', {}, 'Button ID: ' + demo.vm.buttonId()),
    m('div', {}, 'Selection Value: ' + demo.vm.selectionValue()),
    (function() {

      if (!demo.vm.showXrefs) {
        return;
      }

      var content;
      var xrefs = demo.vm.xrefs();
      if (!!xrefs && xrefs.length > 0) {
        content = '<div>hello</div>';
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

//initialize the application
m.mount(document.querySelector('#demo'), {controller: demo.controller, view: demo.view});

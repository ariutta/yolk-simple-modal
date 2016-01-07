var m = window.m;

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
        content: '<div>Hello World! ' + new Date().toISOString() + '</div>',
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

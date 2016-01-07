# mithril-simple-modal

[Mithril](http://lhorie.github.io/mithril/index.html) wrapper for [wunderlink/simple-modal](https://github.com/wunderlink/simple-modal).

This module runs a post-install script to compile the coffeescript, Jade and CSS from simple-modal into a single vanilla JS file. This JS file is then wrapped to work with Mithril.

# How to Use

Create a Mithril component to serve as the body of the modal, e.g.:

```js
var modalContent = {};
modalContent.view = function() {
  return m('div', {
    onclick: m.withAttr('textContent', demo.vm.closeAndSave)
  }, demo.vm.value());
};
```

Then add an element like the following to the parent view to control the display of the modal.

```js
var demo = {};
demo.vm = (function() {
  var vm = {};

  vm.init = function() {
    vm.value = m.prop('this is some sample modal content');

    vm.modalStatus = function() {
      if (vm.showValue()) {
        if (!!vm.value()) {
          return 'open';
        } else {
          return 'loading';
        }
      } else {
        return 'closed';
      }
    };

    vm.closeAndSave = function(value) {
      // do something
    };

    vm.cancel = function() {
      vm.showValue = false;
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
      return m.component(mSimpleModal, {
        title: 'sample title',
        content: modalContent,
        buttons: [{
          text: 'Cancel',
          closeOnClick: true,
          callback: demo.vm.cancel
        }],
        status: vm.modalStatus()
      });
    })()
  ]);
};

//initialize the application
m.mount(document.body, {controller: demo.controller, view: demo.view});
```

TODO: test this example, possibly using [mockdown](https://github.com/pjeby/mockdown).

For more examples, see the directory `./test/e2e/`.

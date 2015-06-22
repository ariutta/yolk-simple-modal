/******************************
 * simpleModal
 *****************************/
var m = require('mithril');
var simpleModal = require('simple-modal');

module.exports = (function(window) {

  var compose = function(f, g) {
    return function(x) {
      return f(g(x));
    };
  };

  /** @namespace */
  var modalComponent = {};

  /**
  modalComponent config factory.
  @param {Object} ctrl - as modified in vm.init
  */
  modalComponent.config = function(ctrl) {
    return function(element, isInitialized) {
      var modalContainer = document.querySelector('.simple-modal-holder');
      if (!isInitialized) {
        m.startComputation();
        var args = ctrl.vm.args;
        args.content = '';
        args.attachToBody = false;
        args.removeOnClose = false;
        var modalParent = element.parentNode;

        if (!modalContainer) {
          var modalInstance = simpleModal(args);
          modalContainer = modalInstance.m;
        }

        var modalContentContainer = modalContainer.querySelector('.simple-modal-content');
        modalParent.removeChild(element);
        modalContentContainer.appendChild(element);
        modalParent.appendChild(modalContainer);
        m.endComputation();
      }

      if (modalContainer && modalContainer.style.display === 'none') {
        modalContainer.style.display = 'block';
      }
    };
  };

  modalComponent.vm = (function() {
    var vm = {};
    vm.init = function(ctrl, testargs) {
      vm.args = ctrl;
    };
    return vm;
  })();

  modalComponent.controller = function(ctrl) {
    this.vm = modalComponent.vm;
    modalComponent.vm.init(ctrl);
  };

  // TODO Why are both ctrl and testargs passed in?
  modalComponent.view = function(ctrl, testargs) {
    var content = testargs.content;
    if (typeof content === 'string') {
      content = m.trust(content);
    }

    // NOTE this is a sort-of confusing section.
    // The div below is initially the parent of the modal content,
    // but it gets moved inside the simple modal, such that what is
    // returned is the simple modal element with the modal title,
    // contents and buttons.
    return m('div', {
      config: modalComponent.config(ctrl)
    }, [
      content
    ]);

  };

  function close() {
    var modalContainer = document.querySelector('.simple-modal-holder');
    modalComponent.vm.display = modalContainer.style.display = 'none';
  }

  function wrapClose(fn) {
    return compose(close, fn);
  }

  var mSimpleModal = {
    component: modalComponent,
    wrapClose: wrapClose
  };

  if (window) {
    window.mSimpleModal = mSimpleModal;
  }

  return mSimpleModal;

})(window);

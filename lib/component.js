/******************************
 * simpleModal
 *****************************/
var m = require('mithril');
var Rx = require('rx');
var simpleModal = require('simple-modal');

module.exports = (function() {

  var compose = function(f, g) {
    return function(x) {
      return f(g(x));
    };
  };

  /** @namespace */
  var modalComponent = {};

  /**
  modalComponent config factory. The params in this doc refer to properties
                                        of the `ctrl` argument
  @param {Object} data - the data with which to populate the <option> list
  @param {number} value - the id of the item in `data` that we want to select
  @param {function(Object id)} onchange - the event handler to call when the selection changes.
      `id` is the the same as `value`
  */
  modalComponent.config = function(ctrl, testargs) {
    //m.startComputation();
    //var deferred = m.deferred();
    return function(element, isInitialized) {
      if (!isInitialized) {
        m.startComputation();
        var args = ctrl.vm.args;
        args.content = '';
        args.attachToBody = false;
        var modalInstance = simpleModal(args);
        var modalParent = element.parentNode;
        var modalContentContainer = modalInstance.m.querySelector('.simple-modal-content');
        modalParent.removeChild(element);
        modalContentContainer.appendChild(element);
        modalParent.appendChild(modalInstance.m);
        m.endComputation();
      }

      //return deferred.promise;

      //update the view with the latest controller value
      //xrefSelectionModal.content = 'updated modal content';
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

  /* Why are both ctrl and testargs passed in?
  modalComponent.view = function(ctrl, testargs) {
  }
  //*/
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

  function deconstruct() {
    var modalContainer = document.querySelector('.simple-modal-holder');
    //modalContainer.parentNode.removeChild(modalContainer);
    modalContainer.remove();
  }

  function wrapClose(fn) {
    return compose(deconstruct, fn);
  }

  return {
    component: modalComponent,
    wrapClose: wrapClose
  };
})();

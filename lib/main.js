/******************************
 * simpleModal
 *****************************/
// TODO figure out why m.redraw doesn't work with browserify
// and kaavio-editor
//var m = require('mithril');
var m = window.m;
var simpleModal = require('simple-modal');
var Spinner = require('spin.js');

module.exports = (function(window) {

  var compose = function(f, g) {
    return function(x) {
      return f(g(x));
    };
  };

  var spinnerOptions = {
    lines: 13, // The number of lines to draw
    length: 20, // The length of each line
    width: 10, // The line thickness
    radius: 30, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };

  var spinner = new Spinner(spinnerOptions);

  /** @namespace */
  var modalComponent = {};

  /**
  modalComponent config factory.
  @param {Object} ctrl - as modified in vm.init
  */
  modalComponent.config = function(ctrl) {
    return function(element, isInitialized) {
      var modalContainer = document.querySelector('.simple-modal-holder');
      var modalContentContainer;
      var args = ctrl.vm.args;
      var mithrilContentProvided = !!args.content;
      if (!isInitialized) {
        m.startComputation();

        // Need to do this to give simpleModal placeholder content
        args.content = '';
        args.attachToBody = false;
        args.removeOnClose = false;
        var modalParent = element.parentNode;

        if (!modalContainer) {
          var modalInstance = simpleModal(args);
          modalContainer = modalInstance.m;
        }

        modalContentContainer = modalContainer.querySelector('.simple-modal-content');
        modalParent.removeChild(element);
        modalContentContainer.appendChild(element);
        modalParent.appendChild(modalContainer);
        m.endComputation();

        if (!mithrilContentProvided) {
          if (!modalContentContainer) {
            modalContentContainer = modalContainer.querySelector('.simple-modal-content');
          }
          spinner.spin(modalContentContainer);
        }
      }

      if (modalContainer && modalContainer.style.display === 'none') {
        modalContainer.style.display = 'block';
        if (!mithrilContentProvided) {
          if (!modalContentContainer) {
            modalContentContainer = modalContainer.querySelector('.simple-modal-content');
          }
          spinner.spin(modalContentContainer);
        }
      }

    };
  };

  modalComponent.vm = (function() {
    var vm = {};
    vm.init = function(ctrl) {
      vm.args = ctrl;
    };
    return vm;
  })();

  modalComponent.controller = function(ctrl) {
    this.vm = modalComponent.vm;
    modalComponent.vm.init(ctrl);
  };

  // TODO Why are both ctrl and args passed in?
  modalComponent.view = function(ctrl, args) {
    var content = args.content;
    if (!content) {
      content = m('div', {
        style: {
          height: '140px'
        }
      }, 'Loading...');
    } else {
      spinner.stop();
    }

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

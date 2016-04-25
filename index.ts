/// <reference path="typings/main/ambient/rx/index.d.ts" />
/// <reference path="typings/main/definitions/spin.js/index.d.ts" />
/// <reference path="typings/main/definitions/simple-modal/index.d.ts" />
/// <reference path="typings/main/definitions/yolk/index.d.ts" />

/******************************
 * Yolk simpleModal
 *****************************/

/* jshint ignore:start */
import * as createSimpleModal from './node_modules/simple-modal/simple-modal.compiled.js';
import * as Spinner from 'spin.js';
import * as Rx from 'rx';
/* jshint ignore:end */
import { CustomComponent, h } from 'yolk';

export class SimpleModalWrapper extends CustomComponent {
  //_instance: any;
  onMount(props, node) {
    //this._instance = $(node).myjQueryThing(props);
    console.log('props');
    console.log(props);
    console.log('node');
    console.log(node);
    node.setAttribute('class', props.className);
    //this._instance = {};
  }

  onUpdate(props, node) {
    //this._instance.update(props);
    node.setAttribute('class', props.className);
  }

  onUnmount() {
    //this._instance.destroy();
    node.setAttribute('class', '');
  }
}
//
//
//// NOTE: using the compiled version so that we can avoid the headaches of trying
//// to work with uncompiled coffescript, jade and CSS (such as during
//// unit testing in Node.js with jsdom).
//var createSimpleModal = require('../node_modules/simple-modal/simple-modal.compiled.js');
//var Spinner = require('spin.js');
//
///* How this works
// *
// * A) Content immediately available
// *    1) Open modal
// *    2) Show content
// * B) Content is promised but not yet resolved
// *    1) Open modal
// *    2) Show loading indicator
// *    3) When content resolves, stop loading indicator and show content
// */
//
///* Statuses
// * - closed
// * - loading
// * - open
// */
//
//module.exports = (function(window) {
//
//  var compose = function(f, g) {
//    return function(x) {
//      return f(g(x));
//    };
//  };
//
//  var spinnerContainerHeight = '140px';
//  var spinnerOptions = {
//    lines: 13, // The number of lines to draw
//    length: 20, // The length of each line
//    width: 10, // The line thickness
//    radius: 30, // The radius of the inner circle
//    corners: 1, // Corner roundness (0..1)
//    rotate: 0, // The rotation offset
//    direction: 1, // 1: clockwise, -1: counterclockwise
//    color: '#000', // #rgb or #rrggbb or array of colors
//    speed: 1, // Rounds per second
//    trail: 60, // Afterglow percentage
//    shadow: false, // Whether to render a shadow
//    hwaccel: false, // Whether to use hardware acceleration
//    className: 'spinner', // The CSS class to assign to the spinner
//    zIndex: 2e9, // The z-index (defaults to 2000000000)
//    top: '50%', // Top position relative to parent
//    left: '50%' // Left position relative to parent
//  };
//
//  var spinner = new Spinner(spinnerOptions);
//
//  /** @namespace */
//  var modalComponent = {};
//
//  /**
//  modalComponent config factory.
//  @param {Object} ctrl - as modified in vm.init
//  */
//  modalComponent.config = function(ctrl) {
//
//    function updateSpinner(isLoading, modalContentContainer) {
//      if (isLoading) {
//        spinner.spin(modalContentContainer);
//      } else {
//        spinner.stop();
//      }
//    }
//
//    return function(element, isInitialized) {
//      var modalContainer = document.querySelector('.simple-modal-holder');
//      var args = ctrl.vm.args;
//
//      var content = args.content;
//      var status = ctrl.vm.status();
//      var isLoading = (status === 'loading');
//      if (!isInitialized) {
//        m.startComputation();
//
//        var modalParent = element.parentNode;
//
//        if (!modalContainer) {
//          // Need to do this to give the modal placeholder content
//          // TODO I don't fully understand why this works, but it
//          // appears that args.content is undefined until the component
//          // is initialized. Once the component is initialized, it appears
//          // that args and ctrl in the view function switch or something such
//          // that args here does not correspond to args in the view.
//          // So somehow, this works, even though it looks odd.
//          var simpleModalArgs = {
//            title: args.title,
//            buttons: args.buttons,
//            content: '<span></span>',
//            attachToBody: false,
//            removeOnClose: false
//          };
//          var modalInstance = createSimpleModal(simpleModalArgs);
//          modalContainer = modalInstance.m;
//        }
//
//        if (!args.modalContentContainer) {
//          args.modalContentContainer = modalContainer.querySelector('.simple-modal-content');
//        }
//
//        modalParent.removeChild(element);
//        args.modalContentContainer.appendChild(element);
//        modalParent.appendChild(modalContainer);
//        // TODO: this will override the style of the *first* overlay;
//        // might make specific in case there are multiple overlays
//        var overlay = document.querySelector('.simple-modal-overlay');
//        overlay.style.opacity = 0.4;
//        overlay.style.backgroundColor = '#fff';
//
//        updateSpinner(isLoading, args.modalContentContainer);
//
//        m.endComputation();
//      }
//
//      if (status !== 'closed') {
//        modalContainer.style.display = 'block';
//        updateSpinner(isLoading, args.modalContentContainer);
//      } else {
//        modalContainer.style.display = 'none';
//      }
//    };
//  };
//
//  modalComponent.vm = (function() {
//    var vm = {};
//    vm.init = function(ctrl) {
//      vm.args = ctrl;
//      vm.status = m.prop('closed');
//    };
//    return vm;
//  })();
//
//  modalComponent.controller = function(ctrl) {
//    this.vm = modalComponent.vm;
//    modalComponent.vm.init(ctrl);
//  };
//
//  // TODO Why are both ctrl and args passed in?
//  modalComponent.view = function(ctrl, args) {
//
//    var content = args.content;
//
//    var status = args.status;
//    ctrl.vm.status(status);
//
//    if (status === 'closed') {
//      // just a placeholder
//      content = m('span');
//    } else if (status === 'loading') {
//      content = m('div', {
//        style: {
//          // We specify this height in order to make room for the spinner
//          height: spinnerContainerHeight
//        }
//      });
//    } else if (status === 'open') {
//      if (typeof content === 'string') {
//        content = m.trust(content);
//      }
//    } else {
//      throw new Error('Unrecognized status.');
//    }
//
//    // NOTE this is a sort-of confusing section.
//    // The div below is initially the parent of the modal content,
//    // but it gets moved inside the simple modal, such that what is
//    // returned is the simple modal element with the modal title,
//    // contents and buttons.
//    return m('div', {
//      config: modalComponent.config(ctrl)
//    }, [
//      content
//    ]);
//  };
//
//  if (typeof window !== 'undefined') {
//    window.mSimpleModal = modalComponent;
//  }
//
//  return modalComponent;
//
//})(window);

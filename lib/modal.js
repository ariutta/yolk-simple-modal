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

  function render(mithrilComponent, args) {
    m.startComputation();
    args.content = args.content || ' ';

    function getSimpleModalContentContainer(cb) {
      var that = this;
      var simpleModalContentContainer = document.querySelector('.simple-modal-content');
      if (!!simpleModalContentContainer) {
        return cb(null, simpleModalContentContainer);
      } else {
        if (!that.isInitialized) {
          var simpleModalInstance = simpleModal(args);
          that.isInitialized = true;
        }
        // TODO use Mutation Observers once they are more widely supported.
        setTimeout(getSimpleModalContentContainer.call(that, cb), 100);
      }
    }

    getSimpleModalContentContainer(function(err, simpleModalContentContainer) {
      m.endComputation();
      args.data(null);
      return m.render(simpleModalContentContainer, mithrilComponent);
    });
  }

  function deconstruct() {
    var simpleModalContainer = document.querySelector('.simple-modal-holder');
    //simpleModalContainer.parentNode.removeChild(simpleModalContainer);
    simpleModalContainer.remove();
  }

  function wrapClose(fn) {
    return compose(deconstruct, fn);
  }

  return {
    render: render,
    wrapClose: wrapClose
  };
})();

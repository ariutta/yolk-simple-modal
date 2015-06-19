var m = require('mithril');
var Rx = require('rx');

module.exports = (function() {
  //this application only has one component: todo
  var todo = {};

  //for simplicity, we use this component to namespace the model classes

  //the Todo class has two properties
  todo.Todo = function(data) {
    this.description = m.prop(data.description);
    this.done = m.prop(false);
  };

  //the TodoList class is a list of Todo's
  todo.TodoList = Array;

  //the view-model tracks a running list of todos,
  //stores a description for new todos before they are created
  //and takes care of the logic surrounding when adding is permitted
  //and clearing the input after adding a todo to the list
  todo.vm = (function() {
    var vm = {};
    vm.init = function() {

      var nonMithrilResultSync = document.getElementById('non-mithril-result-sync');
      var nonMithrilResultAsync = document.getElementById('non-mithril-result-async');

      var clickSource = Rx.Observable.fromEvent(document, 'click')
        .map(function(e) {
          return e;
        });

      vm.positionSync = m.prop('');
      clickSource.subscribe(function(e) {
        nonMithrilResultSync.innerHTML = e.clientX + ', ' + e.clientY + ' (Non-mithril, sync)';
        vm.positionSync(e.clientX + ', ' + e.clientY);
      });

      var asyncClickSource = clickSource.map(function(x) {
        console.log('+ start');
        m.startComputation();
        return x;
      }).flatMap(function(e) {
        console.log('  asyncClickSource flatMap');
        return Rx.Observable.fromNodeCallback(function(cb) {
          console.log('  asyncClickSource fromNodeCallback');
          window.setTimeout(function() {
            console.log('  timeout');
            return cb(null, e);
          }, 1000);
        })();
      })
      .map(function(x) {
        console.log('- end');
        m.endComputation();
        return x;
      });

      vm.positionAsync = m.prop('');
      asyncClickSource.subscribe(function(e) {
        nonMithrilResultAsync.innerHTML = e.clientX + ', ' + e.clientY + ' (Non-mithril, async)';
        vm.positionAsync(e.clientX + ', ' + e.clientY);
      });

      // Selection ID
      vm.selectionId = m.prop('');
      var selectionIdAndResetSource = asyncClickSource.map(function(e) {
        var target = e.target;
        return target.id || target.getAttribute('id');
      })
      .partition(function(id) {
        return !!id;
      });

      var selectionIdSource = selectionIdAndResetSource[0];
      var resetSource = selectionIdAndResetSource[1];

      selectionIdSource.subscribe(function(selectionId) {
        vm.selectionId(selectionId);
      });

      resetSource.subscribe(function() {
        vm.selectionId('');
      });

      //a running list of todos
      vm.list = new todo.TodoList();

      //a slot to store the name of a new todo before it is created
      vm.description = m.prop('');

      //adds a todo to the list, and clears the description field for user convenience
      vm.add = function() {
        if (vm.description()) {
          vm.list.push(new todo.Todo({description: vm.description()}));
          vm.description('');
        }
      };
    };
    return vm;
  }());

  //the controller defines what part of the model is relevant for the current page
  //in our case, there's only one view-model that handles everything
  todo.controller = function() {
    todo.vm.init();
  };

  //here's the view
  todo.view = function() {
    return m('div', {
      //onclick: todo.vm.add
    }, [
      m('div', {}, todo.vm.positionSync() + '(Mithril, sync)'),
      m('div', {}, todo.vm.positionAsync() + '(Mithril, async)'),
      m('div', {}, todo.vm.selectionId() + '(selectionId)'),
      m('input', {
        onchange: m.withAttr('value', todo.vm.description), value: todo.vm.description()
      }),
      m('button', {onclick: todo.vm.add}, 'Add'),
      m('table', [
        todo.vm.list.map(function(task, index) {
          return m('tr', [
            m('td', [
              m('input[type=checkbox]', {
                onclick: m.withAttr('checked', task.done), checked: task.done()
              })
            ]),
            m('td', {
              style: {
                textDecoration: task.done() ? 'line-through' : 'none'
              }
            }, task.description()),
          ]);
        })
      ])
    ]);
  };

  //initialize the application
  m.mount(document.querySelector('#todo'), {controller: todo.controller, view: todo.view});
})();

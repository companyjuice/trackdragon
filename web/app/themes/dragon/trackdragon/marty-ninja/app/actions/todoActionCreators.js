var Marty = require('marty');
var TodoConstants = require('../constants/todoConstants');
var NavigationActionCreators = require('./navigationActionCreators');


var TodoActionCreators = Marty.createActionCreators({
  id: 'TodoActionCreators',

  /**
   * @param  {string} text
   */
  create: function(text) {
    this.dispatch(TodoConstants.TODO_CREATE, text);
  },

  /**
   * @param  {string} id The ID of the ToDo item
   * @param  {string} text
   */
  updateText: function(id, text) {
    this.dispatch(TodoConstants.TODO_UPDATE_TEXT, id, text);
  },

  /**
   * Toggle whether a single ToDo is complete
   * @param  {object} todo
   */
  toggleComplete: function(todo) {
    var id = todo.id;
    if (todo.complete) {
      this.dispatch(TodoConstants.TODO_UNDO_COMPLETE, id);
    } else {
      this.dispatch(TodoConstants.TODO_COMPLETE, id);
    }
  },

  /**
   * Mark all ToDos as complete
   */
  toggleCompleteAll: function() {
    this.dispatch(TodoConstants.TODO_TOGGLE_COMPLETE_ALL);
  },

  /**
   * @param  {string} id
   */
  destroy: function(id) {
    this.dispatch(TodoConstants.TODO_DESTROY, id);
  },

  /**
   * Delete all the completed ToDos
   */
  destroyCompleted: function() {
    this.dispatch(TodoConstants.TODO_DESTROY_COMPLETED);
  }
});

module.exports = TodoActionCreators;

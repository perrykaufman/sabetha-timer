/*
 * a custom event mixin for javascript objects
 */
const eventMixin = {
  /*
   * adds a handler to be called for a given event
   * @param event - the name of the event
   * @param handler - the function to handle the event
   */
  on(event, handler) {
    if (!this._handlers) {
      this._handlers = {};
    }
    if (!this._handlers[event]) {
      this._handlers[event] = [];
    }
    this._handlers[event].push(handler);
  },
  /*
   * removes a handler to be used for a given event
   * @param event - the name of the event
   * @param handler - the function to handle the event
   */
  off(event, handler) {
    const handlers = this._handlers && this._handlers[event];
    if (!handlers) return;
    handlers.forEach((func, index) => {
      if (func !== handler) return;
      handlers.splice(index, 1);
    });
  },
  /* PRIVATE
   * dispatch an event with arguments
   * @param event - the name of the event
   * @param args - the arguments for the event handler
   */
  _dispatch(event, ...args) {
    const handlers = this._handlers && this._handlers[event];
    if (!handlers) return;
    handlers.forEach(func => {
      func.call(null, ...args);
    });
  }
};

export default eventMixin;

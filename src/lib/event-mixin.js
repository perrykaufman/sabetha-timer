const eventMixin = {
  on(event, handler) {
    if (!this._handlers) {
      this._handlers = {}
    }
    if (!this._handlers[event]) {
      this._handlers[event] = []
    }
    this._handlers[event].push(handler)
  },
  off(event, handler) {
    const handlers = this._handlers && this._handlers[event]
    if (!handlers) return
    handlers.forEach((func, index) => {
      if (func != handler) return
      handlers.splice(index, 1)
    })
  },
  _dispatch(event, ...args) {
    const handlers = this._handlers && this._handlers[event]
    if (!handlers) return
    handlers.forEach((func) => {
      func.apply(null, args)
    })
  }
}

export default eventMixin
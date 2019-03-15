import EventMixin from './event-mixin.js'

const INTERVAL = 1000

class SimpleTimer {
  constructor(startTime) {
    this._state = {}
    this._startTime = startTime
    this.reset()
    this._interval = null
  }
  reset() {
    if (this.isActive) this.stop()
    this._minutes = this._startTime.minutes
    this._seconds = this._startTime.seconds
  }
  start() {
    if (this.isActive) return
    if (this.minutes == 0 && this.seconds == 0) return
    this._interval = setInterval(() => this._tick(), INTERVAL)
    this.dispatch('start')
  }
  stop() {
    if (!this.isActive) return
    clearInterval(this._interval)
    this._interval = null
    this.dispatch('stop')
  }
  get isActive() {
    if (this._interval) return true
    return false
  }
  get minutes() {
    return this._minutes
  }
  get seconds() {
    return this._seconds
  }
  get _minutes() {
    return this._state.minutes
  }
  set _minutes(value) {
    this._state.minutes = value
  }
  get _seconds() {
    return this._state.seconds
  }
  set _seconds(value) {
    this._state.seconds = value
  }
  get _startTime() {
    return this._state.startTime
  }
  set _startTime({minutes = 0, seconds = 0} = {}) {
    if (typeof minutes != 'number') {
      throw new TypeError('minutes must be a number')
    }
    if (typeof seconds != 'number') {
      throw new TypeError('seconds must be a number')
    }
    this._state.startTime = {
      minutes: minutes > 0 ? Math.floor(minutes) : 0,
      seconds: seconds > 0 ? Math.floor(seconds) : 0
    }
  }
  _tick() {
    if (this._minutes == 0 && this._seconds == 0) {
      this.stop()
    } else if (this._seconds == 0) {
      this._minutes--
      this._seconds = 59
    } else {
      this._seconds--
    }
    this.dispatch('tick', {minutes: this._minutes, seconds: this._seconds})
  }
}

Object.assign(SimpleTimer.prototype, EventMixin)

export default SimpleTimer
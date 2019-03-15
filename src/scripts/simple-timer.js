import EventMixin from './event-mixin.js'

const INTERVAL = 1000

class SimpleTimer {
  constructor(startTime) {
    this._state = {}
    this._startTime = startTime
    this._interval = null
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
  start(startTime) {
    if (this.isActive) return
    if (startTime) this._startTime = startTime
    this._minutes = this._startTime.minutes
    this._seconds = this._startTime.seconds
    this._interval = setInterval(() => this._tick(), INTERVAL)
    this.dispatch('start')
  }
  reset(startTime) {
    this.stop()
    if (startTime) {
      this._startTime = startTime
    }
  }
  stop() {
    if (!this.isActive) return
    clearInterval(this._interval)
    this._interval = null
    this.dispatch('stop')
  }
  get minutes() {
    return this.isActive ? this._minutes : this._startTime.minutes
  }
  get _minutes() {
    return this._state.minutes
  }
  set _minutes(value) {
    this._state.minutes = Math.floor(value)
    this.dispatch('minutes-change', this._state.minutes)
  }
  get seconds() {
    return this.isActive ? this._seconds : this._startTime.seconds
  }
  get _seconds() {
    return this._state.seconds
  }
  set _seconds(value) {
    this._state.seconds = Math.floor(value)
    this.dispatch('seconds-change', this._state.seconds)
  }
  get _startTime() {
    return Object.assign({}, this._state.startTime)
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
  get isActive() {
    if (this._interval) return true
    return false
  }
}

Object.assign(SimpleTimer.prototype, EventMixin)

export default SimpleTimer
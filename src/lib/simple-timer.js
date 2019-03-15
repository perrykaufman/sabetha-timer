import EventMixin from '@lib/event-mixin.js'

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
    this._dispatch('start', {minutes: this.minutes, seconds: this.seconds})
  }
  stop() {
    if (!this.isActive) return
    clearInterval(this._interval)
    this._interval = null
    this._dispatch('stop')
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
    if (typeof minutes !== 'number' || minutes < 0) {
      throw new TypeError('minutes must be a positive number')
    }
    if (typeof seconds !== 'number' || seconds < 0) {
      throw new TypeError('seconds must be a positive number')
    }
    this._state.startTime = {
      minutes: Math.floor(minutes + (seconds / 60)),
      seconds: Math.floor(seconds % 60)
    }
  }
  _tick() {
    let minutes = this._minutes
    let seconds = this._seconds
    
    seconds--
    
    if (seconds < 0) {
      seconds = 59
      minutes--
    }
    
    this._minutes = minutes
    this._seconds = seconds
    this._dispatch('tick', {minutes, seconds})

    if (minutes == 0 && seconds == 0) {
      this.stop()
    }
  }
}

Object.assign(SimpleTimer.prototype, EventMixin)

export default SimpleTimer
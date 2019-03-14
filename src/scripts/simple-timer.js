import EventMixin from './event-mixin.js'

const INTERVAL = 1000

class SimpleTimer {
  constructor({minutes = 0, seconds = 0}) {
    this.startTime = {minutes, seconds}
    this._state = {
      minutes: 0,
      seconds: 0,
    }
    this._interval = null
  }
  _tick() {
    if (this.minutes == 0 && this.seconds == 0) {
      this.stop()
    } else if (this.seconds == 0) {
      this.minutes--
      this.seconds = 59
    } else {
      this.seconds--
    }
    this.dispatch('tick', {minutes: this.minutes, seconds: this.seconds})
  }
  start() {
    this.minutes = this.startTime.minutes
    this.seconds = this.startTime.seconds
    this._interval = setInterval(() => this._tick(), INTERVAL)
    this.dispatch('start')
  }
  reset({minutes, seconds = 0}) {
    if (minutes) {
      this.startTime.minutes = minutes
      this.startTime.seconds = seconds
    }
    this.stop()
  }
  stop() {
    clearInterval(this._interval)
    this._interval = null
    this.dispatch('stop')
  }
  get minutes() {
    return this._state.minutes
  }
  set minutes(value) {
    if (typeof value != 'number') {
      throw new TypeError('minutes must be a number')
    }
    this._state.minutes = Math.floor(value)
    this.dispatch('minutes-change', this._state.minutes)
  }
  get seconds() {
    return this._state.seconds
  }
  set seconds(value) {
    if (typeof minutes != 'number') {
      throw new TypeError('seconds must be a number')
    }
    this._state.seconds = Math.floor(value)
    this.dispatch('seconds-change', this._state.seconds)
  }
  get isActive() {
    if (this._interval) return true
    return false
  }
}

Object.assign(SimpleTimer, EventMixin)

export default SimpleTimer
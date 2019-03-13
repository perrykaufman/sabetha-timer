import EventMixin from './event-mixin.js'

const INTERVAL = 1000

class SimpleTimer {
  constructor(minutes, seconds) {
    this.startTime = {minutes, seconds}
    this.seconds = seconds
    this._state = {
      minutes: 0,
      seconds: 0,
    }
  }
  _tick() {
    //TODO
  }
  start() {
    //TODO
  }
  reset() {
    //TODO
  }
  get minutes() {
    return this._state.minutes
  }
  set minutes(value) {
    if (typeof value != 'number') {
      throw new TypeError('minutes must be a number')
    }
    this._state.minutes = Math.floor(value)
    this.dispatch('minutes-change')
  }
  get seconds() {
    return this._state.seconds
  }
  set seconds(value) {
    if (typeof minutes != 'number') {
      throw new TypeError('seconds must be a number')
    }
    this._state.seconds = Math.floor(value)
    this.dispatch('seconds-change')
  }
}

Object.assign(SimpleTimer, EventMixin)

export default SimpleTimer
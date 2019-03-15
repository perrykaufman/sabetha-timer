import EventMixin from '@lib/event-mixin.js'
import {isStringArray} from '@lib/util.js'
import SimpleTimer from '@lib/simple-timer.js'

const CANON_ENUM = {
  SOUTH: 1,
  WEST: 2,
  NORTH: 3,
  EAST: 4,
  properties: {
    1: {direction: 'South', symbol: 'Arrow'},
    2: {direction: 'West', symbol: 'Circle'},
    3: {direction: 'North', symbol: 'Heart'},
    4: {direction: 'East', symbol: 'Square'},
  },
}

const CANON_START = {minutes: 8, seconds: 25 }

const CANON_ORDER = [1, 2, 3, 4, 1, 3, 2, 4]

class SabethaTimer {
  constructor(toSpeech) {
    this._toSpeech = toSpeech
    this._config = {}
    this._timer = null
  }
  async start(options) {
    if(this._timer) return
    this._configure(options)

    if (this._config.countdown) {
      await this._countdownPhase()
    }
    
    await this._canonsPhase()

    this._timer = null
  }
  reset() {
    this._timer.stop()
  }
  _configure({countdown, canons, voice} = {}) {
    if (typeof countdown != 'boolean') {
      countdown = true
    }
    if (canons != 'symbol' && canons != 'direction' && !isStringArray(canons)) {
      canons = 'symbol'
    }
    if(voice != 'male' || voice != 'female') {
      voice = 'female'
    }
    
    this._config = {countdown, canons, voice}
  }
  _countdownPhase() {
    this._timer = new SimpleTimer({seconds: 5})
    
    const announce = SabethaTimer._makeCountAnnouncer()

    this._timer.on('tick', (time) => {
      this._dispatch('tick', time)
      announce(time)
    })

    const promise = new Promise(resolve => {
      this._timer.on('stop', () => {
        this._dispatch('end-countdown')
        resolve()
      })
    })

    this._dispatch('start-countdown')
    this._timer.start()
    return promise
  }
  _canonsPhase() {
    this._timer = new SimpleTimer({minutes: 9, seconds: 2})

    const announce = SabethaTimer._makeCanonAnnouncer()

    this._timer.on('tick', (time) => {
      this._dispatch('tick', time)
      announce(time)
    })

    const promise = new Promise(resolve => {
      this._timer.on('stop', () => {
        this._dispatch('end-canons')
        resolve()
      })
    })

    this._dispatch('start-canons')
    this._timer.start()

    return promise
  }
  static _makeCanonAnnouncer() {
    return ({minutes, seconds}) => {
      //TODO: announce canons
      console.log(`${minutes}:${seconds}`)
    }
  }
  static _makeCountAnnouncer() {
    return ({seconds}) => {
      if (seconds == 0) {
        //announce go
        console.log('go')
      } else {
        //announce seconds
        console.log(String(seconds))
      }
    }
  }
}

Object.assign(SabethaTimer.prototype, EventMixin)

export default SabethaTimer
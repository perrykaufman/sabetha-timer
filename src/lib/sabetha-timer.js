import EventMixin from './event-mixin.js'
import SimpleTimer from './simple-timer.js'

const CANON_Enum = {
  SOUTH: 1,
  WEST: 2,
  NORTH: 3,
  EAST: 4,
  properties: {
    1: {name: 'South', symbol: 'Arrow'},
    2: {name: 'West', symbol: 'Circle'},
    3: {name: 'North', symbol: 'Heart'},
    4: {name: 'East', symbol: 'Square'},
  },
}

const CANON_ORDER = [1, 2, 3, 4, 1, 3, 2, 4]

const START_TIME = {minutes: 9, seconds: 0}

class SabethaTimer {
  constructor(toSpeech) {
    this.toSpeech = toSpeech
    this.config = {}
    this.timer = null
  }
  start(options) {

  }
  reset() {

  }
}

Object.apply(SabethaTimer, EventMixin)

export default SabethaTimer
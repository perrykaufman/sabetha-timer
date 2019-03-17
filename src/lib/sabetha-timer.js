import EventMixin from '@lib/event-mixin.js'
import SimpleTimer from '@lib/simple-timer.js'

//information used to calculate and name canon spawns
const Canons = new Object(null)
Canons.start = {minutes: 8, seconds: 25 }
Canons.interval = 30
Canons.order = [0, 1, 2, 3, 0, 2, 1, 3]
Canons.alias = [
  {direction: 'South', symbol: 'Arrow'},
  {direction: 'West', symbol: 'Circle'},
  {direction: 'North', symbol: 'Heart'},
  {direction: 'East', symbol: 'Square'},
]

/*
 * Creates an object used to make voice call outs for canon spawns in the Sabetha
 * raid boss in Guild Wars 2
 */
class SabethaTimer {
  constructor(caller) {
    this._caller = caller
    this._config = {}
    this._timer = null
  }
  /*
   * Start the countdown timer
   * @param options - timer configuration options
   */
  async start(options) {
    if(this._timer) return
    this._configure(options)

    let active = true
    
    //start countdown unless disabled
    if (this._config.countdown) {
      active = await this._countdownPhase()
    }
    
    //start canon callouts
    if (active) {
      await this._canonsPhase()
    }

    //remove timer
    this._timer = null
  }
  /*
   * Stop and reset the timer
   */
  reset() {
    if (!this._timer) return
    this._timer.stop()
    this._timer = null
  }
  /*
   * Validate and set the configuration
   * @param options - timer configuration options
   */
  _configure({countdown, canons} = {}) {
    //validate countdown
    if (typeof countdown != 'boolean') {
      countdown = true
    }
    //validate canon names
    if (
      canons != 'symbol' &&
      canons != 'direction' &&
      !(
        canons instanceof Array &&
        canons.every(el => typeof el == 'string') &&
        canons.length == 4)
    ) {
      canons = 'symbol';
    }
    
    this._config = {countdown, canons}
  }
  /*
   * Start voice countdown
   * @return - promise that resolves when countdown finished
   */
  _countdownPhase() {
    this._timer = new SimpleTimer({seconds: 5})
    
    const announce = SabethaTimer._makeCountAnnouncer(this._caller)

    this._timer.on('start', (time) => {
      this._dispatch('countdown-start', time)
      announce(time)
    })
    
    this._timer.on('tick', (time) => {
      this._dispatch('tick', time)
      announce(time)
    })

    const promise = new Promise(resolve => {
      this._timer.on('finish', () => {
        this._dispatch('countdown-finish')
        resolve(true)
      })
      this._timer.on('stop', () => {
        resolve(false)
      })
    })

    this._timer.start()
    return promise
  }
  /*
   * Start voice callouts of canons
   * @return - promise that resolves when finished
   */
  _canonsPhase() {
    this._timer = new SimpleTimer({minutes: 9, seconds: 2})

    const announce = SabethaTimer._makeCanonAnnouncer(this._caller)

    this._timer.on('start', (time) => {
      this._dispatch('canons-start', time)
    })
    
    this._timer.on('tick', (time) => {
      this._dispatch('tick', time)
      announce(time)
    })

    const promise = new Promise(resolve => {
      this._timer.on('finish', () => {
        this._dispatch('canons-finish')
        resolve(true)
      })      
      this._timer.on('stop', () => {
        this._dispatch('reset')
        resolve(false)
      })
    })

    this._timer.start()

    return promise
  }
  /*
   * Create a function to announce canons
   * @param caller - the caller used for voice synthesis
   * @return - function that announces canons
   */
  static _makeCanonAnnouncer(caller) {
    let canon = 0
    let warnAt = Canons.start.seconds + 10
    let throwAt = Canons.start.seconds
    return ({minutes, seconds}) => {
      console.log(`${minutes}:${seconds}`)
      //announce canon warning
      if (seconds == warnAt) {
        caller.call(`${Canons.alias[Canons.order[canon]].direction} soon`)
        warnAt = (warnAt + 30) % 60 //set 30 seconds forward
      }
      //announce canon spawn
      if (seconds == throwAt) {
        caller.call(`throw ${Canons.alias[Canons.order[canon]].direction}`)
        throwAt = (throwAt + 30) % 60 //set 30 seconds forward
        canon = (canon + 1) % Canons.order.length //set to next index
      }
    }
  }
  /*
   * Create a function to announce countdown
   * @param caller - the caller used for voice synthesis
   * @return - function that announces countdown
   */
  static _makeCountAnnouncer(caller) {
    return ({seconds}) => {
      if (seconds == 0) {
        //announce go
        caller.call('go')
      } else {
        //announce seconds
        caller.call(String(seconds))
      }
    }
  }
}

//add event mixin
Object.assign(SabethaTimer.prototype, EventMixin)

export default SabethaTimer
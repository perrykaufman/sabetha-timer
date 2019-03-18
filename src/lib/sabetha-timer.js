import EventMixin from '@lib/event-mixin.js'

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

const INTERVAL = 1000

/*
 * Creates an object used to make voice call outs for canon spawns in the Sabetha
 * raid boss in Guild Wars 2
 */
class SabethaTimer {
  constructor(caller) {
    this._caller = caller
    this._config = {}
    this._interval = null
  }
  /*
   * Start the countdown timer
   * @param options - timer configuration options
   */
  start(options) {
    if(this._interval) return
    this._configure(options)

    this._dispatch('start')
    
    const announce = this._makeAnnouncer()

    announce()

    this._interval = setInterval(() => announce(), INTERVAL)
  }
  /*
   * Stop and reset the timer
   */
  reset() {
    if (!this._interval) return
    clearInterval(this._interval)
    this._interval = null
    this._dispatch('reset')
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
  _makeAnnouncer() {
    const announceCountdown = this._makeCountdownAnnouncer()
    const announceCanons = this._makeCanonAnnouncer()

    return () => {
      let countdownDone = true
      let canonsDone = false
      
      if (this._config.countdown) {
        countdownDone = announceCountdown()
      }
      
      if (countdownDone) {
        canonsDone = announceCanons()
      }

      if (canonsDone) {
        clearInterval(this._interval)
        this._interval = null
        this._dispatch('finish')
      }
    }
  }
  /*
   * Create a function to announce canons
   * @param caller - the caller used for voice synthesis
   * @return - function that announces canons
   */
  _makeCanonAnnouncer() {
    let canon = 0
    let seconds = 542 //9 minutes, 2 seconds
    return () => {
      if (seconds < 0) return true

      //announce canon warning 
      if (seconds <= 515 && (seconds - 5) % 30 == 0) {
        this._caller.call(`${Canons.alias[Canons.order[canon]].direction} soon`)
      }
      //announce canon spawn
      if (seconds <= 515 && (seconds + 5) % 30 == 0) {
        this._caller.call(`throw ${Canons.alias[Canons.order[canon]].direction}`)
        canon = (canon + 1) % Canons.order.length //set to next index
      }

      this._dispatch('update', {
        minutes: Math.floor(seconds / 60),
        seconds: seconds % 60
      })

      seconds--
      return false
    }
  }
  /*
   * Create a function to announce countdown
   * @param caller - the caller used for voice synthesis
   * @return - function that announces countdown
   */
  _makeCountdownAnnouncer() {
    let seconds = 5
    return () => {
      if (seconds < 0) return true
      
      if (seconds == 0) {
        this._caller.call('go')
      }

      if (seconds > 0) {
        this._caller.call(String(seconds))
      }

      this._dispatch('update', {
        minutes: Math.floor(seconds / 60),
        seconds: seconds % 60
      })

      seconds--
      return false
    }
  }
}

//add event mixin
Object.assign(SabethaTimer.prototype, EventMixin)

export default SabethaTimer
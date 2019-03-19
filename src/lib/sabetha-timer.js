import EventMixin from "@lib/event-mixin";

// information used to calculate and name canon spawns
const ORDER = [0, 1, 2, 3, 0, 2, 1, 3];
const CANONS = [
  { direction: "South", symbol: "Arrow" },
  { direction: "West", symbol: "Circle" },
  { direction: "North", symbol: "Heart" },
  { direction: "East", symbol: "Square" }
];
const DEFAULT_CONFIG = {
  countdown: true,
  canons: "direction"
};

const INTERVAL = 1000;

/*
 * Creates an object used to make voice call outs for canon spawns in the Sabetha
 * raid boss in Guild Wars 2
 */
class SabethaTimer {
  constructor(caller) {
    this._caller = caller;
    this._config = {};
    this._interval = null;
  }

  /*
   * Start the countdown timer
   * @param options - timer configuration options
   */
  start(options) {
    if (this._interval) return;
    this._configure(options);

    this._dispatch("start");

    const announce = this._makeAnnouncer();

    announce();

    this._interval = setInterval(() => announce(), INTERVAL);
  }

  /*
   * Stop and reset the timer
   */
  reset() {
    if (!this._interval) return;
    clearInterval(this._interval);
    this._interval = null;
    this._dispatch("reset");
  }

  /*
   * Validate and set the configuration
   * @param options - timer configuration options
   */
  _configure({ countdown, canons } = {}) {
    // validate countdown
    this._config.countdown =
      typeof countdown !== "boolean"
        ? SabethaTimer.DEFAULT_CONFIG.countdown
        : countdown;

    // validate canon names
    this._config.canons =
      !(canons in SabethaTimer.CANONS[0]) &&
      !(
        canons instanceof Array &&
        canons.every(el => typeof el === "string") &&
        canons.length === 4
      )
        ? SabethaTimer.DEFAULT_CONFIG.canons
        : canons;
  }

  _tick(seconds) {
    this._dispatch("update", {
      minutes: Math.floor(seconds / 60),
      seconds: seconds % 60
    });
  }

  _getCanonName(index) {
    const config = this._config.canons;

    const canon = SabethaTimer.ORDER[index];

    return config instanceof Array
      ? config[canon]
      : SabethaTimer.CANONS[canon][config];
  }

  _makeAnnouncer() {
    const announceCountdown = this._makeCountdownAnnouncer();
    const announceCanons = this._makeCanonAnnouncer();

    return () => {
      let countdownDone = true;
      let canonsDone = false;

      if (this._config.countdown) {
        countdownDone = announceCountdown();
      }

      if (countdownDone) {
        canonsDone = announceCanons();
      }

      if (canonsDone) {
        clearInterval(this._interval);
        this._interval = null;
        this._dispatch("finish");
      }
    };
  }

  /*
   * Create a function to announce canons
   * @param caller - the caller used for voice synthesis
   * @return - function that announces canons
   */
  _makeCanonAnnouncer() {
    let index = 0;
    let seconds = 542; // 9 minutes, 2 seconds
    return () => {
      if (seconds < 0) return true;

      // announce canon warning
      if (seconds <= 515 && (seconds - 5) % 30 === 0) {
        this._caller.call(`${this._getCanonName(index)} soon`);
      }
      // announce canon spawn
      if (seconds <= 515 && (seconds + 5) % 30 === 0) {
        this._caller.call(`throw ${this._getCanonName(index)}`);
        index = (index + 1) % SabethaTimer.ORDER.length; // set to next index
      }

      this._tick(seconds);

      seconds -= 1;
      return false;
    };
  }

  /*
   * Create a function to announce countdown
   * @param caller - the caller used for voice synthesis
   * @return - function that announces countdown
   */
  _makeCountdownAnnouncer() {
    let seconds = 5;
    return () => {
      if (seconds < 0) return true;

      if (seconds === 0) {
        this._caller.call("go");
      }

      if (seconds > 0) {
        this._caller.call(String(seconds));
      }

      this._tick(seconds);

      seconds -= 1;
      return false;
    };
  }
}

SabethaTimer.CANONS = CANONS;
SabethaTimer.ORDER = ORDER;
SabethaTimer.DEFAULT_CONFIG = DEFAULT_CONFIG;

// add event mixin
Object.assign(SabethaTimer.prototype, EventMixin);

export default SabethaTimer;

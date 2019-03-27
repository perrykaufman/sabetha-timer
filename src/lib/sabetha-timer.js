import EventMixin from "@lib/event-mixin";

// order of the canon spawns
const ORDER = [0, 1, 2, 3, 0, 2, 1, 3];

// default names for the canons
const CANONS = [
  { direction: "South", symbol: "Arrow" },
  { direction: "West", symbol: "Circle" },
  { direction: "North", symbol: "Heart" },
  { direction: "East", symbol: "Square" }
];

// durations of timer modes, etc.
const TIMES = {
  countdown: 5,
  fightEnd: 0,
  fightStart: 542,
  firstCanon: 515
};

// functions to create callout text
const CALLOUTS = {
  countdown(seconds) {
    return seconds < 1 ? "go" : String(seconds);
  },
  spawn(canon) {
    return `throw ${canon}`;
  },
  warn(canon) {
    return `${canon} soon`;
  }
};

// default configuration
const DEFAULT_CONFIG = {
  countdown: true,
  canons: "direction"
};

// interval used by timer
const SECOND = 1000;

/*
 * creates an object used to make voice call outs for canon spawns in the Sabetha
 * raid boss in Guild Wars 2
 *
 * @event start - dispatched when timer starts
 * @event reset - dispatched when timer is reset
 * @event finish - dispatched when timer finishs
 * @event update - dispatched on time change and passes the current time
 *        @passes { minutes, seconds }
 */
class SabethaTimer {
  constructor(caller) {
    this._caller = caller;
    this._config = {};
    this._state = {
      interval: null,
      mode: null,
      seconds: 0
    };
  }

  /*
   * start the countdown timer
   * @param options - timer configuration options
   */
  start(options) {
    if (this._state.interval) return;
    this._configure(options);

    this._dispatch("start");

    this._state.mode = "start";

    this._tick();
    this._state.interval = setInterval(() => this._tick(), SECOND);
  }

  /*
   * stop and reset the timer
   */
  reset() {
    if (!this._state.interval) return;
    clearInterval(this._state.interval);
    this._state.interval = null;
    this._dispatch("reset");
  }

  /* PRIVATE
   * validate and set the configuration
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

  /* PRIVATE
   * handle a tick of the timer, making a callout if required
   */
  _tick() {
    // initialize
    if (this._state.mode === "start") {
      this._state.seconds = this._config.countdown
        ? SabethaTimer.TIMES.countdown + 1
        : SabethaTimer.TIMES.fightStart + 1;
      this._state.mode = this._config.countdown ? "countdown" : "canons";
    }

    // tick
    this._state.seconds -= 1;
    const { seconds } = this._state;
    this._dispatch("update", {
      minutes: Math.floor(seconds / 60),
      seconds: seconds % 60
    });

    // make call out
    const callout = this.getCallout();
    if (callout) {
      this._caller.call(callout);
      this._dispatch("call", callout);
    }

    // countdown is finished
    if (this._state.mode === "countdown" && seconds <= 0) {
      this._state.mode = "canons";
      this._state.seconds = SabethaTimer.TIMES.fightStart + 1;
    }

    // timer is finished
    if (
      this._state.mode === "canons" &&
      this._state.seconds <= SabethaTimer.TIMES.fightEnd
    ) {
      clearInterval(this._state.interval);
      this._state.interval = null;
      this._dispatch("finish");
    }
  }

  /*
   * gets a callout based on the current time and mode
   * return - callout text, null if no callout
   */
  getCallout() {
    const { mode, seconds } = this._state;

    let callout = null;

    if (mode === "countdown") {
      callout = SabethaTimer.CALLOUTS.countdown(seconds);
    }

    if (!callout && mode === "canons") {
      const canon = this.isCanonWarning(seconds);
      callout = canon ? SabethaTimer.CALLOUTS.warn(canon) : null;
    }

    if (!callout && mode === "canons") {
      const canon = this.isCanonSpawn(seconds);
      callout = canon ? SabethaTimer.CALLOUTS.spawn(canon) : null;
    }

    return callout;
  }

  /* PRIVATE
   * gets the name of the canon corresponding to the given index
   * @param index - the index of the canon
   */
  _getCanonName(index) {
    const config = this._config.canons;

    const canon = SabethaTimer.ORDER[index];

    return config instanceof Array
      ? config[canon]
      : SabethaTimer.CANONS[canon][config];
  }

  /*
   * determines if a canon is spawning at the given time
   * @param seconds - the current time
   * @return - the name of the canon, null if none
   */
  isCanonSpawn(seconds) {
    const start = SabethaTimer.TIMES.firstCanon;
    const rotation = SabethaTimer.ORDER.length;

    return seconds <= start && (seconds + 5) % 30 === 0
      ? this._getCanonName(((start - seconds - 10) / 30) % rotation)
      : null;
  }

  /*
   * determines if a canon will spawn soon (i.e. in 10 seconds)
   * @param seconds - the current time
   * @return - the name of the canon, null if none
   */
  isCanonWarning(seconds) {
    const start = SabethaTimer.TIMES.firstCanon;
    const rotation = SabethaTimer.ORDER.length;

    return seconds <= start && (seconds - 5) % 30 === 0
      ? this._getCanonName(((start - seconds) / 30) % rotation)
      : null;
  }
}

SabethaTimer.CANONS = CANONS;
SabethaTimer.ORDER = ORDER;
SabethaTimer.DEFAULT_CONFIG = DEFAULT_CONFIG;
SabethaTimer.TIMES = TIMES;
SabethaTimer.CALLOUTS = CALLOUTS;

// add event mixin
Object.assign(SabethaTimer.prototype, EventMixin);

export default SabethaTimer;

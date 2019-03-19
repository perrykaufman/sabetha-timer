import SabethaTimer from "@lib/sabetha-timer";

class MockCaller {
  constructor(history) {
    this.history = history;
  }

  call(text) {
    this.history.push(text);
  }
}

// the order in which the canons appear
const ORDER = [0, 1, 2, 3, 0, 2, 1, 3];

// the names of the canons
const CANONS = [
  { direction: "South", symbol: "Arrow" },
  { direction: "West", symbol: "Circle" },
  { direction: "North", symbol: "Heart" },
  { direction: "East", symbol: "Square" }
];

// the messages used to call out canons
const warn = canon => `${canon} soon`;
const spawn = canon => `throw ${canon}`;

const INTERVAL = 1000;
const BUFFER = 2;
const COUNTDOWN = 6;
const ENCOUNTER = 9 * 60;
const FIRST_CANON = 35;

describe("sabetha-timer", () => {
  let history;
  let caller;
  let sabtimer;

  afterEach(() => {
    jasmine.clock().uninstall();
    sabtimer.reset();
  });

  beforeEach(() => {
    jasmine.clock().install();
    history = [];
    caller = new MockCaller(history);
    sabtimer = new SabethaTimer(caller);
  });

  it("starts with a 5s countdown by default", () => {
    sabtimer.start();
    jasmine.clock().tick(COUNTDOWN * INTERVAL + 1);
    expect(history).toEqual(["5", "4", "3", "2", "1", "go"]);
  });

  it("can have 5s countdown disabled", () => {
    const countdown = false;
    sabtimer.start({ countdown });
    jasmine.clock().tick(COUNTDOWN * INTERVAL + 1);
    expect(history).toEqual([]);
  });

  it("can have 5s countdown enabled", () => {
    const countdown = true;
    sabtimer.start({ countdown });
    jasmine.clock().tick(COUNTDOWN * INTERVAL + 1);
    expect(history).toEqual(["5", "4", "3", "2", "1", "go"]);
  });

  it("refers to canons by direction by default", () => {
    const directions = CANONS.map(el => el.direction);
    const countdown = false;
    sabtimer.start({ countdown });
    jasmine.clock().tick((FIRST_CANON + BUFFER + 30 * 3) * INTERVAL + 1);

    for (let i = 0; i < 4; i += 1) {
      expect(history[i * 2]).toBe(warn(directions[i]));
      expect(history[i * 2 + 1]).toBe(spawn(directions[i]));
    }
  });

  it("can be set to refer to canons by direction", () => {
    const directions = CANONS.map(el => el.direction);

    const countdown = false;
    const canons = "direction";
    sabtimer.start({ countdown, canons });
    jasmine.clock().tick((FIRST_CANON + BUFFER + 30 * 3) * INTERVAL + 1);

    for (let i = 0; i < 4; i += 1) {
      expect(history[i * 2]).toBe(warn(directions[i]));
      expect(history[i * 2 + 1]).toBe(spawn(directions[i]));
    }
  });

  it("can be set to refer to canons by symbol", () => {
    const symbols = CANONS.map(el => el.symbol);

    const countdown = false;
    const canons = "symbol";
    sabtimer.start({ countdown, canons });
    jasmine.clock().tick((FIRST_CANON + BUFFER + 30 * 3) * INTERVAL + 1);

    for (let i = 0; i < 4; i += 1) {
      expect(history[i * 2]).toBe(warn(symbols[i]));
      expect(history[i * 2 + 1]).toBe(spawn(symbols[i]));
    }
  });

  it("can be set to refer to canons as custom names", () => {
    const symbols = ["one", "two", "three", "four"];

    const countdown = false;
    const canons = symbols;
    sabtimer.start({ countdown, canons });
    jasmine.clock().tick((FIRST_CANON + BUFFER + 30 * 3) * INTERVAL + 1);

    for (let i = 0; i < 4; i += 1) {
      expect(history[i * 2]).toBe(warn(symbols[i]));
      expect(history[i * 2 + 1]).toBe(spawn(symbols[i]));
    }
  });

  it("can be reset during countdown", () => {
    sabtimer.start();
    jasmine.clock().tick(3 * INTERVAL + 1);
    sabtimer.reset();
    jasmine.clock().tick(90 * INTERVAL + 1);
    expect(sabtimer._interval).toBeFalsy();
    expect(history).toEqual(["5", "4", "3", "2"]);
  });

  it("can be reset during canon callouts", () => {
    const countdown = false;
    sabtimer.start({ countdown });
    jasmine.clock().tick(60 * INTERVAL + 1);
    sabtimer.reset();
    jasmine.clock().tick(90 * INTERVAL + 1);
    expect(sabtimer._interval).toBeFalsy();
    expect(history).toEqual([warn("South"), spawn("South"), warn("West")]);
  });

  it("calls out all canons in the correct order", () => {
    const canons = ORDER.map(i => CANONS[i].direction);
    const countdown = false;
    sabtimer.start({ countdown });
    jasmine.clock().tick((ENCOUNTER + BUFFER) * INTERVAL + 1);
    history.forEach((callout, index) => {
      // next canon in rotation
      const canon = canons[Math.floor((index / 2) % 8)];

      // advance warning expected for even callouts
      if (index % 2 === 0) expect(callout).toBe(warn(canon));
      // canon spawn expected  for odd callouts
      else expect(callout).toBe(spawn(canon));
    });
  });

  it("will call out canons after countdown", () => {
    sabtimer.start();
    jasmine.clock().tick((COUNTDOWN + BUFFER + FIRST_CANON) * INTERVAL + 1);
    expect(history).toEqual([
      "5",
      "4",
      "3",
      "2",
      "1",
      "go",
      warn("South"),
      spawn("South")
    ]);
  });

  it("dispatches 'start' event when started", () => {
    let started = false;
    sabtimer.on("start", () => {
      started = true;
    });
    sabtimer.start();
    expect(started).toBe(true);
  });

  it("dispatches 'reset' event when reset", () => {
    let reset = false;
    sabtimer.on("reset", () => {
      reset = true;
    });
    sabtimer.start({ countdown: false });
    jasmine.clock().tick(30 * INTERVAL + 1);
    expect(reset).toBe(false);
    sabtimer.reset();
    expect(reset).toBe(true);
  });

  it("dispatches 'finish' event when finished", () => {
    const countdown = false;
    let finished = false;
    sabtimer.on("finish", () => {
      finished = true;
    });
    sabtimer.start({ countdown });

    expect(finished).toBe(false);
    jasmine.clock().tick((ENCOUNTER + BUFFER) * INTERVAL + 1);
    expect(finished).toBe(false);
    jasmine.clock().tick(1 * INTERVAL);
    expect(finished).toBe(true);
  });

  it("dispatches 'update' event with {minutes, seconds} for each time change during countdown", () => {
    const times = [];
    sabtimer.on("update", time => {
      times.push(time);
    });
    sabtimer.start();
    jasmine.clock().tick(COUNTDOWN * INTERVAL + 1);

    for (let i = 0; i < COUNTDOWN; i += 1) {
      expect(times[i]).toEqual({ minutes: 0, seconds: 5 - i });
    }
  });

  it("dispatches 'update' event with {minutes, seconds} for each time change during canon callouts", () => {
    const countdown = false;
    const times = [];
    sabtimer.on("update", time => {
      times.push(time);
    });
    sabtimer.start({ countdown });
    jasmine.clock().tick(60 * INTERVAL + 1);

    for (let i = 0; i < 60; i += 1) {
      expect(times[i]).toEqual({
        minutes: Math.floor((ENCOUNTER + BUFFER - i) / 60),
        seconds: (ENCOUNTER + BUFFER - i) % 60
      });
    }
  });
});

/* eslint-env jasmine */

import SabethaTimer from "@lib/sabetha-timer";

class MockCaller {
  constructor(history) {
    this.history = history;
  }

  call(text) {
    this.history.push(text);
  }
}

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
    const canons = [
      "South",
      "West",
      "North",
      "East",
      "South",
      "North",
      "West",
      "East"
    ];
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
    sabtimer.on("update", time => times.push(time));
    sabtimer.start();
    jasmine.clock().tick(COUNTDOWN * INTERVAL + 1);
    expect(times[0]).toEqual({ minutes: 0, seconds: 5 });
    expect(times[1]).toEqual({ minutes: 0, seconds: 4 });
    expect(times[2]).toEqual({ minutes: 0, seconds: 3 });
    expect(times[3]).toEqual({ minutes: 0, seconds: 2 });
    expect(times[4]).toEqual({ minutes: 0, seconds: 1 });
  });

  xit("dispatches 'update' event with {minutes, seconds} for each time change during canon callouts", () => {});
});

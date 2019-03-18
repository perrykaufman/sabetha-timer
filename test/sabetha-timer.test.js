import SabethaTimer from '@lib/sabetha-timer.js'

class MockCaller {
  constructor(history) {
    this.history = history
  }
  
  call(text) {
    this.history.push(text)
  }
}

const warn = (canon) => `${canon} soon`
const spawn = (canon) => `throw ${canon}`

const INTERVAL = 1000
const BUFFER = 2

describe('sabetha-timer', function() {
  let history
  let caller
  let sabtimer

  afterEach(function() {
    jasmine.clock().uninstall()
    sabtimer.reset()
  })
  
  beforeEach(function() {
    jasmine.clock().install()
    history = []
    caller = new MockCaller(history)
    sabtimer = new SabethaTimer(caller)
  })
  
  it('starts with a 5s countdown by default', function() {
    sabtimer.start()
    jasmine.clock().tick(5 * INTERVAL + 1)
    expect(history).toEqual(['5','4','3','2','1','go'])
  })

  it('can have 5s countdown disabled', function() {
    const countdown = false
    sabtimer.start({countdown})
    jasmine.clock().tick(5 * INTERVAL + 1)
    expect(history).toEqual([])
  })

  it('can be reset during countdown', async function() {
    const promise = sabtimer.start()
    jasmine.clock().tick(3 * INTERVAL + 1)
    sabtimer.reset()
    await promise
    jasmine.clock().tick(90 * INTERVAL + 1)
    expect(sabtimer._timer).toBeFalsy()
    expect(history).toEqual(['5', '4', '3', '2'])

  })

  it('can be reset during canon callouts', async function() {
    const countdown = false
    const promise = sabtimer.start({countdown})
    jasmine.clock().tick(60 * INTERVAL + 1)
    sabtimer.reset()
    jasmine.clock().tick(90 * INTERVAL + 1)
    await promise
    expect(sabtimer._timer).toBeFalsy()
    expect(history).toEqual([warn('South'), spawn('South'), warn('West')])
  })

  it('calls out all canons in the correct order', function() {
    const canons = ['South', 'West', 'North', 'East', 'South', 'North', 'West', 'East']
    const countdown = false
    sabtimer.start({countdown})
    jasmine.clock().tick((9 * 60 + BUFFER) * INTERVAL + 1)
    history.forEach((callout, index) => {
      //next canon in rotation
      const canon = canons[Math.floor(index / 2 % 8)]
      
      //advance warning expected for even callouts
      if (index % 2 == 0) expect(callout).toBe(warn(canon))
      
      //canon spawn expected  for odd callouts
      else expect(callout).toBe(spawn(canon))
    })
  })

  it('dispatches \'start\' event when started', function() {
    let started = false
    sabtimer.on('start', () => started = true)
    sabtimer.start()
    expect(started).toBe(true)
  })

  it('dispatches \'reset\' event when reset', async function() {
    let reset = false
    sabtimer.on('reset', () => reset = true)
    const promise = sabtimer.start({countdown: false})
    jasmine.clock().tick(30 * INTERVAL + 1)
    expect(reset).toBe(false)
    sabtimer.reset()
    await promise
    expect(reset).toBe(true)
  })

  it('dispatches \'finish\' event when finished', async function() {
    const countdown = false
    let finished = false
    sabtimer.on('finish', () => finished = true)
    const promise = sabtimer.start({countdown})
    
    expect(finished).toBe(false)
    jasmine.clock().tick((9 * 60 + BUFFER - 1) * INTERVAL + 1)
    expect(finished).toBe(false)
    jasmine.clock().tick(1 * INTERVAL)
    //wait for start function to finish
    await promise
    expect(finished).toBe(true)
  })

  it('dispatches \'update\' event with {minutes, seconds} for each time change during countdown', function() {
    const times = []
    sabtimer.on('update', (time) => times.push(time))
    sabtimer.start()
    jasmine.clock().tick(5 * INTERVAL + 1)
    expect(times[0]).toEqual({minutes: 0, seconds: 5})
    expect(times[1]).toEqual({minutes: 0, seconds: 4})
    expect(times[2]).toEqual({minutes: 0, seconds: 3})
    expect(times[3]).toEqual({minutes: 0, seconds: 2})
    expect(times[4]).toEqual({minutes: 0, seconds: 1})
    expect(times[5]).toEqual({minutes: 0, seconds: 0})
  })

  xit('dispatches \'update\' event with {minutes, seconds} for each time change during canon callouts', function() {

  })
})
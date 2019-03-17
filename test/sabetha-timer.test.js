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

  it('can be reset during countdown', function() {
    sabtimer.start()
    jasmine.clock().tick(3 * INTERVAL + 1)
    sabtimer.reset()
    jasmine.clock().tick(90 * INTERVAL + 1)
    expect(sabtimer._timer).toBeFalsy()
    expect(history).toEqual(['5', '4', '3', '2'])

  })

  it('can be reset during canon callouts', function() {
    const countdown = false
    sabtimer.start({countdown})
    jasmine.clock().tick(60 * INTERVAL + 1)
    sabtimer.reset()
    jasmine.clock().tick(90 * INTERVAL + 1)
    expect(sabtimer._timer).toBeFalsy()
    expect(history).toEqual([warn('South'), spawn('South'), warn('West')])
  })

  it('calls out all canons in the correct order', function() {
    const canons = ['South', 'West', 'North', 'East', 'South', 'North', 'West', 'East']
    const countdown = false
    sabtimer.start({countdown})
    jasmine.clock().tick((9 * 60 + BUFFER) * INTERVAL + 1)
    for (let i = 0; i < history.length-1; i += 2) {
      expect(history[i]).toBe(warn(canons[i / 2 % 8]))
      expect(history[i+1]).toBe(spawn(canons[i / 2 % 8]))
    }
  })
})
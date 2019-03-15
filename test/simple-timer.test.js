import SimpleTimer from '@scripts/simple-timer.js'

describe('simple-timer', function() {
  /* changing these values will break the tests */
  const minutes = 1
  const seconds = 30
  const INTERVAL = 1000
  let timer

  afterEach(function() {
    if (timer instanceof SimpleTimer) timer.stop()
    timer = undefined
  })

  it('create timer with minutes', function() {
    timer = new SimpleTimer({minutes})
    expect(timer.minutes).toBe(minutes)
    expect(timer.seconds).toBe(0)
    expect(timer.isActive).toBe(false)
  })
  it('create timer with seconds', function() {
    timer = new SimpleTimer({seconds})
    expect(timer.minutes).toBe(0)
    expect(timer.seconds).toBe(seconds)
    expect(timer.isActive).toBe(false)
  })
  it('create timer with minutes and seconds', function() {
    timer = new SimpleTimer({minutes, seconds})
    expect(timer.minutes).toBe(minutes)
    expect(timer.seconds).toBe(seconds)
    expect(timer.isActive).toBe(false)
  })
  it('create timer with initial values', function() {
    timer = new SimpleTimer()
    expect(timer.minutes).toBe(0)
    expect(timer.seconds).toBe(0)
    expect(timer.isActive).toBe(false)
  })

  //using start() on a timer that is already active will not break it
  it('can be started if active', function() {
    timer = new SimpleTimer()
    timer.start()
    const interval1 = timer._interval
    expect(() => timer.start()).not.toThrow()
    const interval2 = timer._interval
    expect(interval1).toBe(interval2)
    expect(timer.isActive).toBe(true)
  })

  it('can be stopped if inactive', function() {
    timer = new SimpleTimer()
    expect(() => timer.stop()).not.toThrow()
    expect(timer.isActive).toBe(false)
  })

  it('has event mixin', function() {
    timer = new SimpleTimer()
    expect(timer.dispatch).toBeTruthy()
    expect(timer.on).toBeTruthy()
    expect(timer.off).toBeTruthy()
  })

  describe('with event mixin', function() {
    beforeEach(function() {
      jasmine.clock().install()
      timer = new SimpleTimer({minutes, seconds})
    })
    afterEach(function() {
      jasmine.clock().uninstall()
    })

    it('dispatchs \'start\' event', function() {
      let started = false
      timer.on('start', () => started = true)
      timer.start()
      expect(started).toBe(true)
    })
  
    it('dispatchs \'tick\' event each second', function() {
      const expectedTicks = 3
      let ticks = 0
      timer.on('tick', () => ticks++)
      timer.start()
      jasmine.clock().tick(expectedTicks * INTERVAL + 1)
      expect(ticks).toBe(expectedTicks)
    })
    
    it('dispatchs \'stop\' event', function() {
      let stopped = false
      timer.on('stop', () => stopped = true)
      timer.start()
      jasmine.clock().tick(91 * INTERVAL + 1)
      expect(stopped).toBe(true)
    })
  })

  describe('timer ticks', function() {
    beforeEach(function() {
      jasmine.clock().install()
      timer = new SimpleTimer({minutes, seconds})
      timer.start()
    })
    afterEach(function() {
      jasmine.clock().uninstall()
    })
    
    it('0 seconds', function() {
      jasmine.clock().tick(0 * INTERVAL + 1)
      expect(timer.minutes).toBe(minutes)
      expect(timer.seconds).toBe(seconds)
      expect(timer.isActive).toBe(true)
    })

    it('1 second', function() {
      jasmine.clock().tick(1 * INTERVAL + 1)
      expect(timer.minutes).toBe(minutes)
      expect(timer.seconds).toBe(29)
      expect(timer.isActive).toBe(true)
    })

    it('30 seconds', function() {
      jasmine.clock().tick(30 * INTERVAL + 1)
      expect(timer.minutes).toBe(minutes)
      expect(timer.seconds).toBe(0)
      expect(timer.isActive).toBe(true)
    })

    it('31 seconds', function() {
      jasmine.clock().tick(31 * INTERVAL + 1)
      expect(timer.minutes).toBe(minutes - 1)
      expect(timer.seconds).toBe(59)
      expect(timer.isActive).toBe(true)
    })

    it('1 minute 30 seconds', function() {
      jasmine.clock().tick(90 * INTERVAL + 1)
      expect(timer.minutes).toBe(0)
      expect(timer.seconds).toBe(0)
      expect(timer.isActive).toBe(true)
    })

    it('1 minute 31 seconds to 0', function() {
      jasmine.clock().tick(91 * INTERVAL + 1)
      expect(timer.minutes).toBe(minutes)
      expect(timer.seconds).toBe(seconds)
      expect(timer.isActive).toBe(false)
    })
  })
});
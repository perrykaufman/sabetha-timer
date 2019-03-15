import SimpleTimer from '@scripts/simple-timer.js'

describe('simple-timer', function() {
  /* changing these values will break the tests */
  const minutes = 1
  const seconds = 30
  const INTERVAL = 1000
  let timer

  afterEach(function() {
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

  it('has event mixin', function() {
    timer = new SimpleTimer()
    expect(timer.dispatch).toBeTruthy()
    expect(timer.on).toBeTruthy()
    expect(timer.off).toBeTruthy()
  })

  describe('timer ticks', function() {
    beforeEach(function() {
      jasmine.clock().install()
      timer = new SimpleTimer({minutes, seconds})
      timer.start()
    })
    afterEach(function() {
      jasmine.clock().uninstall()
      timer.stop()
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
import SimpleTimer from '@scripts/simple-timer.js'

describe('simple-timer tests', function() {
  it('is initialized correctly', function() {
    const timer = new SimpleTimer({minutes: 2})
    expect(timer.startTime.minutes).toBe(2)
    expect(timer.startTime.seconds).toBe(0)
    expect(timer.isActive).toBe(false)
  })
});
import * as LineZipper from './LineZipper'

describe('LineZipper', function() {
  it('should have initial value', function() {
    const z = LineZipper.initial
    expect(z).toBeDefined()
  })
})

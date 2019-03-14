import * as LineZipper from './LineZipper'
import * as Zipper from './TreeZipper'
import { pipe } from 'ramda'
import * as LineTree from './LineTree'

describe('LineZipper', function() {
  it('should have initial value', function() {
    expect(LineZipper.initial).toBeDefined()
  })
  it('should do something', function() {
    const z = pipe(Zipper.appendGoR(LineTree.newLine()))(
      LineZipper.initial,
    )

    expect(z).toBeDefined()
    expect(z).toMatchObject({ center: expect.anything() })
  })
})

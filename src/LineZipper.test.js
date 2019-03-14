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

    expect(Zipper.datum(z)).toMatchInlineSnapshot(
      {
        title: expect.any(String),
        id: expect.any(String),
      },
      `
Object {
  "collapsed": false,
  "id": Any<String>,
  "title": Any<String>,
}
`,
    )
  })
})

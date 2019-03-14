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

    expect(Zipper.tree(z)).toMatchInlineSnapshot(`
Object {
  "children": Array [],
  "datum": Object {
    "childIds": Array [],
    "collapsed": false,
    "id": "n_Kue3CMPj-RP144SXJ32OK",
    "title": "Boyle",
  },
}
`)
  })
})

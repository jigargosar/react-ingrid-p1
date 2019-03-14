import * as Tree from './Tree'
import * as LineZipper from './LineZipper'

describe('LineZipper', function() {
  it('should do something', function() {
    const tree = Tree.fromDatum('a')
    expect(Tree.datum(tree)).toBe('a')
    const z = LineZipper.initial
    expect(z).toBeDefined()
  })
})

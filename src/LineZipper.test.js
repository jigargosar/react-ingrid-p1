import * as Tree from './Tree'

describe('LineZipper', function() {
  it('should do something', function() {
    const tree = Tree.fromDatum('a')
    expect(Tree.datum(tree)).toBe('a')
  })
})

import * as LineZipper from './LineZipper'
import * as Zipper from './TreeZipper'
import { pipe } from 'ramda'
import * as LineTree from './LineTree'
import * as Tree from './Tree'
import validate from 'aproba'

function anyParentCollapsed(z) {
  validate('O', arguments)
  const pz = Zipper.parent(z)
  // return pz ? Zipper.datum(pz).collapsed || anyParentCollapsed(pz) : false
  return pz
    ? !LineZipper.hasVisibleChildren(pz) || anyParentCollapsed(pz)
    : false
}

describe('LineZipper', function() {
  it('should have initial value', function() {
    expect(LineZipper.initial).toBeDefined()
  })
  it('should do something', function() {
    const z = pipe(
      Zipper.appendChildGoR(
        Tree.fromDatum({ collapsed: true, title: 'rc1' }),
      ),
      Zipper.appendChildGoR(
        Tree.fromDatum({ collapsed: false, title: 'rc1-1' }),
      ),
      Zipper.parent,
      Zipper.appendChildGoR(
        Tree.fromDatum({ collapsed: true, title: 'rc2' }),
      ),
      Zipper.findPrev(z => {
        return !anyParentCollapsed(z)
      }),
    )(Zipper.singleton(Tree.fromDatum({ collapsed: false, title: 'r' })))

    const lt = Zipper.tree(z)
    expect(LineTree.title(lt)).toBe('rc1')
    expect(LineTree.hasVisibleChildren(lt)).toBe(false)
  })
})

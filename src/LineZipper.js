import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as LineTree from './LineTree'
import { either, ifElse, isNil, pipe, T } from 'ramda'

export { Zipper as Z, LineTree as LT }

export function foo() {
  validate('O', arguments)

  return 1
}

function hasVisibleChildren(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.hasVisibleChildren,
  )
  return fn(z)
}

export function isVisible(z) {
  const fn = ifElse(either(isNil, hasVisibleChildren), T, isVisible)
  return fn(Zipper.parent(z))
}

import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as LineTree from './LineTree'
import { either, ifElse, isNil, pipe, T } from 'ramda'

export const initial = Zipper.singleton(LineTree.initial)

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

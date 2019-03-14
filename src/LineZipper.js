import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as LineTree from './LineTree'
import { either, ifElse, isNil, T } from 'ramda'

export { Zipper as Z, LineTree as LT }

export function foo() {
  validate('O', arguments)

  return 1
}

export function isVisible(z) {
  const fn = ifElse(
    either(isNil, LineTree.hasVisibleChildren),
    T,
    isVisible,
  )
  return fn(Zipper.parent(z))
}

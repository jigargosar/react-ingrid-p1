import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as LineTree from './LineTree'

export { Zipper as Z, LineTree as LT }

export function foo() {
  validate('O', arguments)

  return 1
}

export function isVisible(z) {
  return true
}

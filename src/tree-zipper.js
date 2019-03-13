import validate from 'aproba'
import * as R from 'ramda'

export function singleton(tree) {
  validate('O', arguments)
  return { left: [], center: tree, right: [], crumbs: [] }
}

export function appendChildGoR(child, z) {
  validate('OO', arguments)
  return {
    left: z.center.children,
    center: child,
    right: [],
    crumbs: R.prepend({
      left: z.left,
      datum: z.center.datum,
      right: z.right,
    })(z.crumbs),
  }
}

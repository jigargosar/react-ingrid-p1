import validate from 'aproba'
import * as R from 'ramda'
import * as tree from './tree'

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

export function parent(z) {
  validate('O', arguments)
  if (R.isEmpty(z.crumbs)) {
    return null
  } else {
    const crumb = R.head(z.crumbs)
    return {
      left: crumb.left,
      center: R.compose(
        tree.replaceChildren([...z.left, z.center, ...z.right]),
        tree.fromDatum,
      )(crumb.datum),
      right: crumb.right,
      crumbs: R.tail(z.crumbs),
    }
  }
}

export function root(z) {
  validate('O', arguments)
  const parent_ = parent(z)
  return parent_ ? root(parent_) : z
}

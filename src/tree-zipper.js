import validate from 'aproba'
import * as R from 'ramda'
import * as Tree from './tree'

export function singleton(tree) {
  validate('O', arguments)
  return { left: [], center: tree, right: [], crumbs: [] }
}

export const appendGoR = R.curry(function appendGoR(tree, z) {
  validate('OO', arguments)
  return {
    ...z,
    left: R.append(z.center)(z.left),
    center: tree,
  }
})

export const appendChildGoR = R.curry(function appendChildGoR(child, z) {
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
})

export function parent(z) {
  validate('O', arguments)
  if (R.isEmpty(z.crumbs)) {
    return null
  } else {
    const crumb = R.head(z.crumbs)
    return {
      left: crumb.left,
      center: R.compose(
        Tree.replaceChildren([...z.left, z.center, ...z.right]),
        Tree.fromDatum,
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

export function tree(z) {
  validate('O', arguments)
  return z.center
}

R.compose(
  R.tap(console.log),
  root,
  parent,
  appendGoR(Tree.fromDatum('2nd child of foo')),
  appendChildGoR(Tree.fromDatum('1st child of foo')),
  singleton,
  Tree.fromDatum,
)('foo')

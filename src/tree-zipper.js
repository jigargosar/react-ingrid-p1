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

export function datum(z) {
  validate('O', arguments)
  return R.compose(
    Tree.datum,
    tree,
  )(z)
}

export function prevSibling(z) {
  validate('O', arguments)
  const ps = R.last(z.left)
  return ps
    ? {
        ...z,
        left: R.init(z.left),
        center: ps,
        right: R.prepend(z.center)(z.right),
      }
    : null
}

export function nextSibling(z) {
  validate('O', arguments)
  const ns = R.head(z.right)
  return ns
    ? {
        ...z,
        left: R.append(z.center)(z.left),
        center: ns,
        right: R.tail(z.right),
      }
    : null
}

const orElseLazy = R.curry(function orElse(thunk, nullable) {
  validate('F*', arguments)
  return R.when(R.isNil, thunk, nullable)
})

export function firstChild(z) {
  validate('O', arguments)
  const children = Tree.children(z.center)
  if (R.isEmpty(children)) return

  return {
    left: [],
    center: R.head(children),
    right: R.tail(children),
    crumbs: R.prepend({
      left: z.left,
      datum: z.center.datum,
      right: z.right,
    })(z.crumbs),
  }
}

export function next(z) {
  validate('O', arguments)
  return R.compose(
    orElseLazy(() => nextSiblingOfParent(z)),
    orElseLazy(() => nextSibling(z)),
    firstChild,
  )(z)
}

function nextSiblingOfParent(z) {
  validate('O', arguments)
  if (root(z) === z) return null
  return R.compose(
    pz =>
      pz
        ? R.compose(
            orElseLazy(() => nextSiblingOfParent(pz)),
            nextSibling,
          )(pz)
        : null,
    parent,
  )(z)
}

export function prev(z) {
  validate('O', arguments)
  if (root(z) === z) return null
  return R.compose(
    orElseLazy(() => parent(z)),
    prevSibling,
  )(z)
}

export const withRollback = R.curry(function withRollback(opFn, z) {
  validate('FO', arguments)
  const nz = opFn(z)
  return nz ? nz : z
})

R.compose(
  R.tap(console.log),
  root,
  parent,
  appendGoR(Tree.fromDatum('2nd child of foo')),
  appendChildGoR(Tree.fromDatum('1st child of foo')),
  singleton,
  Tree.fromDatum,
)('foo')

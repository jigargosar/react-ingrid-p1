import validate from 'aproba'
import * as R from 'ramda'
import { compose, curry, ifElse, isNil, when } from 'ramda'
import * as Tree from './Tree'

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
      center: compose(
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

export function rootTree(z) {
  validate('O', arguments)
  return compose(
    tree,
    root,
  )(z)
}

export function tree(z) {
  validate('O', arguments)
  return z.center
}

export function datum(z) {
  validate('O', arguments)
  return compose(
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

export function lastChild(z) {
  validate('O', arguments)
  const children = Tree.children(z.center)
  if (R.isEmpty(children)) return

  return {
    left: R.init(children),
    center: R.last(children),
    right: [],
    crumbs: R.prepend({
      left: z.left,
      datum: z.center.datum,
      right: z.right,
    })(z.crumbs),
  }
}

const whenNil = when(isNil)

export function next(z) {
  validate('O', arguments)
  return compose(
    whenNil(() => nextSiblingOfFirstAncestor(z)),
    whenNil(() => nextSibling(z)),
    firstChild,
  )(z)
}

function nextSiblingOfFirstAncestor(z) {
  validate('O', arguments)
  const pz = parent(z)
  if (!pz || pz === root(z)) return null

  return when(isNil, () => nextSiblingOfFirstAncestor(pz))(nextSibling(pz))
}

export function prev(z) {
  validate('O', arguments)
  if (root(z) === z) return null
  return compose(
    ifElse(isNil, () => parent(z), lastDescendent),
    prevSibling,
  )(z)
}

function lastDescendent(z) {
  validate('O', arguments)

  const lc = lastChild(z)
  return lc ? lastDescendent(lc) : z
}

export const withRollback = R.curry(function withRollback(opFn, z) {
  validate('FO', arguments)
  const nz = opFn(z)
  return nz ? nz : z
})

export const mapDatum = curry(function mapDatum(fn, z) {
  validate('FO', arguments)
  return { ...z, center: Tree.mapDatum(fn, z.center) }
})

export function findPrev(pred) {
  validate('F', arguments)

  return function findPrevInner(z) {
    validate('O', arguments)
    const nz = prev(z)
    if (!nz) return null
    return pred(nz) ? nz : findPrevInner(nz)
  }
}

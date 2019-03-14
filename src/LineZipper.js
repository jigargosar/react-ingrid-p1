import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as LineTree from './LineTree'
import { pipe } from 'ramda'

export const initial = Zipper.singleton(LineTree.initial)

export function hasCollapsedChildren(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.hasCollapsedChildren,
  )
  return fn(z)
}

export function allAncestorsExpanded(z) {
  validate('O', arguments)

  return !anyParentCollapsed(z)
}

export function anyParentCollapsed(z) {
  validate('O', arguments)

  if (Zipper.isRoot(z)) return false

  const pz = Zipper.parent(z)
  return hasCollapsedChildren(pz) || anyParentCollapsed(pz)
}

export function canCollapse(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.canCollapse,
  )
  return fn(z)
}

export function canExpand(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.canExpand,
  )
  return fn(z)
}

export function collapse(z) {
  validate('O', arguments)
  return Zipper.mapTree(LineTree.collapse)(z)
}
export function expand(z) {
  return Zipper.mapTree(LineTree.expand)(z)
}

export const prev = Zipper.withRollback(
  Zipper.findPrev(allAncestorsExpanded),
)

export const next = Zipper.withRollback(
  Zipper.findNext(allAncestorsExpanded),
)

export function parentWithRollback(z) {
  validate('O', arguments)
  return Zipper.withRollback(Zipper.parent, z)
}

export function nest(z) {
  validate('O', arguments)
  const ps = Zipper.prevSibling(z)
  if (ps) {
    pipe(Zipper.removeGoL)
  }

  return z
}

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
  const fn = pipe(
    Zipper.tree,
    LineTree.collapse,
  )
  return fn(z)
}
export function expand(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.expand,
  )
  return fn(z)
}

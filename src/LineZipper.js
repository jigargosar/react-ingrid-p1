import validate from 'aproba'
import * as Zipper from './TreeZipper'
import * as LineTree from './LineTree'
import { assoc, isEmpty, pipe, trim } from 'ramda'

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

export function isTitleBlank(z) {
  validate('O', arguments)
  const fn = pipe(
    Zipper.tree,
    LineTree.title,
    trim,
    isEmpty,
  )
  return fn(z)
}

export function isBlankTitleLeaf(z) {
  validate('O', arguments)
  return Zipper.isLeaf(z) && isTitleBlank(z)
}

export function deleteBlankTitleLeaf(z) {
  validate('O', arguments)
  if (!isBlankTitleLeaf(z)) return null
  return Zipper.withRollback(Zipper.removeGoLOrROrUp)(z)
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

export function indent(z) {
  validate('O', arguments)
  const ps = Zipper.prevSibling(z)
  if (ps) {
    const indent_ = pipe(
      Zipper.removeGoL,
      expand,
      Zipper.appendChildGoR(Zipper.tree(z)),
    )
    return indent_(z)
  }
  return z
}

export function outdent(z) {
  validate('O', arguments)
  const gp = Zipper.grandParent(z)
  if (gp) {
    const outdent_ = pipe(
      Zipper.removeGoUp,
      Zipper.appendGoR(Zipper.tree(z)),
    )
    return outdent_(z)
  }
  return z
}

export function deleteLine(z) {
  validate('O', arguments)

  return Zipper.withRollback(Zipper.removeGoROrLOrUp)(z)
}

export function setTitle(newTitle) {
  return function(z) {
    return Zipper.mapDatum(assoc('title', newTitle))(z)
  }
}

export function moveL(z) {
  validate('O', arguments)

  return Zipper.withRollback(Zipper.moveL, z)
}

export function moveR(z) {
  validate('O', arguments)

  return Zipper.withRollback(Zipper.moveR, z)
}

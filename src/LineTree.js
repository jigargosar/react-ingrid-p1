import validate from 'aproba'
import {
  always,
  both,
  complement,
  cond,
  pipe,
  prop,
  propOr,
  T,
} from 'ramda'
import * as Tree from './Tree'

const datum = Tree.datum

function datumProp(pn, tree) {
  validate('SO', arguments)
  const datumProp_ = pipe(
    datum,
    prop(pn),
  )
  return datumProp_(tree)
}

function datumPropOr(def, pn, tree) {
  validate('*SO', arguments)
  return propOr(def, pn, datum(tree))
}

export function collapsedProp(tree) {
  validate('O', arguments)
  return datumPropOr(false, 'collapsed', tree)
}

const hasChildrenAnd = both(Tree.hasChildren)

export function canExpand(tree) {
  validate('O', arguments)
  return hasChildrenAnd(collapsedProp)(tree)
}

export function canCollapse(tree) {
  validate('O', arguments)
  return hasChildrenAnd(complement(collapsedProp))(tree)
}

export function expandIcon(tree) {
  validate('O', arguments)
  return cond([
    [canExpand, always('+')],
    [canCollapse, always('-')],
    [T, always(' ')],
  ])(tree)
}

export function id(tree) {
  validate('O', arguments)
  return datumProp('id', tree)
}

export function treeIdEq(id_, tree) {
  validate('SO', arguments)
  return id(tree) === id_
}

export function title(tree) {
  validate('O', arguments)
  return datumProp('title', tree)
}

export function visibleChildren(tree) {
  return collapsedProp(tree) ? [] : Tree.children(tree)
}

import validate from 'aproba'
import { always, both, complement, compose, cond, propOr, T } from 'ramda'
import * as Tree from './Tree'

const lineCollapsedProp = propOr(false, 'collapsed')

const datum = Tree.datum

function collapsedProp(tree) {
  validate('O', arguments)
  return compose(
    lineCollapsedProp,
    datum,
  )(tree)
}

const hasChildrenAnd = both(Tree.hasChildren)

function canExpand(tree) {
  validate('O', arguments)
  return hasChildrenAnd(collapsedProp)(tree)
}

function canCollapse(tree) {
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
  return datum(tree).id
}

export function treeIdEq(id_, tree) {
  validate('SO', arguments)
  return id(tree) === id_
}

export function title(tree) {
  validate('O', arguments)
  return datum(tree).title
}

import validate from 'aproba'
import { always, both, complement, compose, cond, T } from 'ramda'
import { collapsedProp } from './Line'
import * as Tree from './Tree'

function treeCollapsedProp(tree) {
  validate('O', arguments)
  return compose(
    collapsedProp,
    Tree.datum,
  )(tree)
}

const treeHasChildrenAnd = both(Tree.hasChildren)

function canExpandTree(tree) {
  validate('O', arguments)
  return treeHasChildrenAnd(treeCollapsedProp)(tree)
}

function canCollapseTree(tree) {
  validate('O', arguments)
  return treeHasChildrenAnd(complement(treeCollapsedProp))(tree)
}

export function treeExpandIcon(tree) {
  validate('O', arguments)
  return cond([
    [canExpandTree, always('+')],
    [canCollapseTree, always('-')],
    [T, always(' ')],
  ])(tree)
}

export function treeId(tree) {
  validate('O', arguments)
  return Tree.datum(tree).id
}

export function treeIdEq(id, tree) {
  validate('SO', arguments)
  return Tree.datum(tree).id === id
}

export function treeTitle(tree) {
  validate('O', arguments)
  return Tree.datum(tree).title
}

import validate from 'aproba'
import {
  append,
  assoc,
  curry,
  isEmpty,
  lensPath,
  not,
  over,
  pipe,
} from 'ramda'

export function fromDatum(datum) {
  validate('*', arguments)
  return { datum, children: [] }
}

export function appendChild(child, parent) {
  validate('OO', arguments)
  return over(lensPath(['children']), append(child))(parent)
}

export const replaceChildren = curry(function replaceChildren(
  newChildren,
  t,
) {
  validate('AO', arguments)
  return assoc('children')(newChildren)(t)
})

export function datum(t) {
  validate('O', arguments)
  return t.datum
}
export function children(t) {
  validate('O', arguments)
  return t.children
}

const overDatum = over(lensPath(['datum']))

export const mapDatum = curry(function mapDatum(fn, t) {
  validate('FO', arguments)
  return overDatum(fn)(t)
})

const isLeaf_ = pipe(
  children,
  isEmpty,
)

export function isLeaf(tree) {
  validate('O', arguments)

  return isLeaf_(tree)
}

const hasChildren_ = pipe(
  isLeaf,
  not,
)

export function hasChildren(tree) {
  validate('O', arguments)
  return hasChildren_(tree)
}

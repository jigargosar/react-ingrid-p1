import validate from 'aproba'
import * as R from 'ramda'
import { curry, lensPath, over } from 'ramda'

export function fromDatum(datum) {
  validate('*', arguments)
  return { datum, children: [] }
}

export function appendChild(child, parent) {
  validate('OO', arguments)
  return R.over(R.lensPath(['children']), R.append(child))(parent)
}

export const replaceChildren = R.curry(function replaceChildren(
  newChildren,
  t,
) {
  validate('AO', arguments)
  return R.assoc('children')(newChildren)(t)
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

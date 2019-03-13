import validate from 'aproba'
import * as R from 'ramda'

export function fromDatum(datum) {
  validate('*', arguments)
  return { datum, children: [] }
}

export function appendChild(child, parent) {
  validate('OO', arguments)
  return R.over(R.lensPath(['children']), R.append(child))(parent)
}

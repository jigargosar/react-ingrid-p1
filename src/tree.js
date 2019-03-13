import validate from 'aproba'

export function fromDatum(datum) {
  validate('*', arguments)
  return { datum, children: [] }
}

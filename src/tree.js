import validate from 'aproba'

function fromDatum(datum) {
  validate('*', arguments)
  return { datum, children: [] }
}

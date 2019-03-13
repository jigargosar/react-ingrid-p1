import validate from 'aproba'

export function singleton(tree) {
  validate('*', arguments)
  return { left: [], center: tree, right: [], crumbs: [] }
}

import validate from 'aproba'

export function singleton(tree) {
  validate('O', arguments)
  return { left: [], center: tree, right: [], crumbs: [] }
}

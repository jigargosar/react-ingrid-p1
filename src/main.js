import { useEffect, useMemo, useState } from 'react'
import * as R from 'ramda'
import { getCached, setCache } from './cache-helpers'
import validate from 'aproba'
import nanoid from 'nanoid'
import faker from 'faker'

function useEffects(setModel) {
  return useMemo(
    () => ({
      log: msg => console.log(msg),
      newLine: parentId =>
        setModel(model => {
          const node = {
            id: `n_${nanoid()}`,
            title: faker.name.lastName(),
            childIds: [],
          }
          return R.compose(
            R.assocPath(['byId', node.id])(node),
            R.over(
              R.lensPath(['byId', parentId, 'childIds']),
              R.append(node.id),
            ),
          )(model)
        }),
    }),
    [],
  )
}

export function rootNode(model) {
  validate('O', arguments)
  return R.path(['byId', model.rootId])(model)
}

function childIds(id, model) {
  validate('SO', arguments)
  return R.path(['byId', id, 'childIds'])(model)
}

export function nodeById(id, model) {
  validate('SO', arguments)
  return R.path(['byId', id])(model)
}

export function childNodes(id, model) {
  validate('SO', arguments)
  const ids = childIds(id, model)
  return R.map(id => nodeById(id, model))(ids)
}

export function useAppModel() {
  const [model, setModel] = useState(() => {
    const rootId = 'n_root'
    const root = {
      id: rootId,
      title: 'Root',
      childIds: [],
    }

    const def = {
      byId: { [root.id]: root },
      rootId,
      selectedId: root.id,
    }

    return R.compose(
      // R.tap(console.log),
      R.mergeDeepRight(def),
      R.defaultTo({}),
      getCached,
    )('app-model')
  })

  useEffect(() => {
    setCache('app-model', model)
  }, [model])

  const effects = useEffects(setModel)
  return [model, effects]
}
